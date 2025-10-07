'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');
const security = require('../utils/encryption');
const { Op } = require('sequelize');
const { server } = require('@passwordless-id/webauthn');

// ---- CONFIG ----
const LOCKOUT_MINUTES = 1; // change to 6 * 60 for 6 hours, etc.
// Generate once offline: bcrypt.hashSync("dummy-password", 10)
const FAKE_HASH = '$2b$10$k3N0v1Y0f9wRzO0c8o2FvO3b0x9t9Hh3yHh8c7c3qz1QbB8Qy9b7a';
const UNIFORM_FAIL = { error: 'Invalid login credentials' };
const UNIFORM_STATUS = 401;

// small timing pad to blur micro-differences (optional)
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function signIn(request, response) {
  try {
    console.log('Received sign-in request body:', request.body);

    const { identifier, password, webauthnCredential } = request.body || {};

    if (!identifier && !webauthnCredential) {
      console.warn('Identifier missing and no WebAuthn credential provided');
      return response.status(400).json({ error: 'Email, username, or phone number is required' });
    }

    console.log('Sign-in request received with identifier:', identifier);

    // ---- Lookup user (don’t reveal existence in response) ----
    console.log('Querying database for user...');
    const user = identifier ? await User.findOne({
      where: {
        [Op.or]: [
          { email: identifier },
          { username: identifier },
          { phoneNumber: identifier }
        ]
      }
    }) : null;

    if (user) console.log('User found:', user.username);
    else console.error('No user found for identifier (internal log only):', identifier);

    const start = Date.now();

    // ---- Password flow ----
    if (password) {
      console.log('Password provided for authentication');

      // Always compare against a hash: real if user exists, otherwise FAKE_HASH
      const hashToCompare = (user && user.password) ? String(user.password).trim() : FAKE_HASH;
      console.log('Using hash for compare (real or fake):', hashToCompare.slice(0, 20) + '...');

      const passwordMatch = await bcrypt.compare(String(password).trim(), hashToCompare);
      console.log('Password comparison result:', passwordMatch);

      // Lock state computed but never disclosed to client
      let locked = false;
      if (user && user.accountLocked && user.lastFailedLogin) {
        const lockOutEnd = new Date(user.lastFailedLogin);
        // lockOutEnd.setHours(lockOutEnd.getHours() + 6);
        lockOutEnd.setMinutes(lockOutEnd.getMinutes() + LOCKOUT_MINUTES);
        console.log('lockout (local):', lockOutEnd.toLocaleString());
        console.log('Lockout end time (UTC):', lockOutEnd.toISOString());
        locked = new Date() < lockOutEnd;
        if (locked) console.warn('Account still locked (internal):', user.username);
      }

      if (!user || locked || !passwordMatch) {
        console.warn('Auth failed (generic):', { identifier, locked, passwordMatch });

        // Only increment counters if we actually have a user and aren’t already locked
        if (user && !locked && !passwordMatch) {
          await updateFailedAttempts(user, identifier);
        }

        // Pad timing to help equalize
        const elapsed = Date.now() - start;
        if (elapsed < 150) await sleep(150 - elapsed);

        return response.status(UNIFORM_STATUS).json(UNIFORM_FAIL);
      }

      // Success path
      console.log('Password authentication successful for user:', user.username);
      user.failedLoginAttempts = 0;
      user.accountLocked = false;
      await user.save();

    // ---- WebAuthn flow ----
    } else if (webauthnCredential) {
      console.log('WebAuthn credential provided. Verifying...');

      if (!user) {
        console.error('No user for WebAuthn identifier (internal):', identifier);
        const elapsed = Date.now() - start;
        if (elapsed < 150) await sleep(150 - elapsed);
        return response.status(UNIFORM_STATUS).json(UNIFORM_FAIL);
      }

      const challenge = user.challenge;
      console.log('Stored challenge for user:', challenge);

      try {
        const authenticationParsed = await server.verifyAuthentication(webauthnCredential, {
          publicKey: user.webauthnPublicKey,
          challenge,
          origin: request.headers.origin,
          userVerified: true,
          counter: user.authCounter,
        });

        console.log('WebAuthn verification successful:', authenticationParsed);

        user.authCounter = authenticationParsed.counter || user.authCounter + 1;
        user.challenge = null;
        user.failedLoginAttempts = 0;
        user.accountLocked = false;
        await user.save();
        console.log('Updated user authentication counter and reset challenge');

      } catch (error) {
        console.error('WebAuthn verification failed:', error);
        const elapsed = Date.now() - start;
        if (elapsed < 150) await sleep(150 - elapsed);
        return response.status(UNIFORM_STATUS).json(UNIFORM_FAIL);
      }

    } else {
      console.warn('No valid authentication method provided');
      return response.status(400).json({ error: 'No valid authentication method provided' });
    }

    // ---- Success response ----
    const encryptedUserId = security.encrypt(user.id);

    console.log('Generating JWT token...');
    const token = jwt.sign({ id: encryptedUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('JWT token generated (not logging full token for safety)');

    response.status(200).json({
      message: 'Sign in successful',
      token,
      expiresIn: 3600,
      user: { id: encryptedUserId, username: user.username }
    });
    console.log('Sign-in response sent for user:', user.username);

  } catch (error) {
    console.error('Unhandled error during sign-in:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
}

// Update failed attempts (internal only; client still gets generic 401)
async function updateFailedAttempts(user, identifier) {
  console.log('Incrementing failed login attempts for user:', user.username);

  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  user.lastFailedLogin = new Date();
  await user.save();

  console.warn('Failed login attempts updated. Total attempts:', user.failedLoginAttempts);

  if (user.failedLoginAttempts >= 3) {
    user.accountLocked = true;
    await user.save();
    console.error('Account locked due to too many failed attempts (internal):', user.username);
  }
}

module.exports = signIn;



















// 'use strict';

// const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');
// const User = require('../models/userModels');
// const security = require('../utils/encryption');
// const { Op } = require('sequelize');
// const { server } = require('@passwordless-id/webauthn');

// // Sign In
// async function signIn(request, response) {
//     try {
//         console.log('Received sign-in request body:', request.body);

//         const { identifier, password, webauthnCredential } = request.body;

//         // Check if identifier is provided
//         if (!identifier) {
//             console.warn('Identifier is missing in request body');
//             return response.status(400).json({ error: 'Email, username, or phone number is required' });
//         }

//         console.log('Sign-in request received with identifier:', identifier);

//         // Check if user exists
//         console.log('Querying database for user...');
//         const user = await User.findOne({
//             where: {
//                 [Op.or]: [
//                     { email: identifier },
//                     { username: identifier },
//                     { phoneNumber: identifier }
//                 ]
//             }
//         });

//         if (!user) {
//             console.error('No user found for identifier:', identifier);
//             return response.status(401).json({ error: 'Invalid login credentials' });
//         }
//         console.log('User found:', user.username);

//         // Check if user account is locked
//         if (user.accountLocked) {
//             console.log('User account is locked. Checking lockout period...');
//             const lockOutEnd = new Date(user.lastFailedLogin);
//             // lockOutEnd.setHours(lockOutEnd.getHours() + 6);
//             lockOutEnd.setMinutes(lockOutEnd.getMinutes() + 1)
//             console.log('lockout (local):', lockOutEnd.toLocaleString());
//             console.log('Lockout end time:', lockOutEnd.toISOString());

//             if (new Date() < lockOutEnd) {
//                 console.warn('Account still locked. Current time:', new Date().toISOString());
//                 return response.status(401).json({ error: `Account is locked, please try again at ${lockOutEnd.toLocaleString()}` });
//             } else {
//                 console.log('Lockout period has expired. Unlocking account...');
//                 user.failedLoginAttempts = 0;
//                 user.accountLocked = false;
//                 await user.save();
//                 console.log('Account unlocked successfully');
//             }
//         }

//         // Determine authentication method
//         if (password) {
//             console.log('Password provided for authentication');
//             console.log('Stored hashed password for user:', user.password);

//             const passwordMatch = await bcrypt.compare(password.trim(), user.password.trim());
//             // const passwordMatch = await bcrypt.compare(password, user.password);

//             console.log('Password comparison result:', passwordMatch);

//             if (!passwordMatch) {
//                 console.warn('Password mismatch for user:', user.username);
//                 await updateFailedAttempts(user, identifier);
//                 return response.status(401).json({ error: 'Invalid login credentials' });
//             }

//             console.log('Password authentication successful for user:', user.username);
//             user.failedLoginAttempts = 0;
//             await user.save();
//         } else if (webauthnCredential) {
//             console.log('WebAuthn credential provided. Verifying...');

//             const challenge = user.challenge;
//             console.log('Stored challenge for user:', challenge);

//             try {
//                 const authenticationParsed = await server.verifyAuthentication(webauthnCredential, {
//                     publicKey: user.webauthnPublicKey,
//                     challenge,
//                     origin: request.headers.origin,
//                     userVerified: true,
//                     counter: user.authCounter,
//                 });

//                 console.log('WebAuthn verification successful:', authenticationParsed);

//                 user.authCounter = authenticationParsed.counter || user.authCounter + 1;
//                 user.challenge = null;
//                 await user.save();
//                 console.log('Updated user authentication counter and reset challenge');
//             } catch (error) {
//                 console.error('WebAuthn verification failed:', error);
//                 return response.status(401).json({ error: 'Invalid WebAuthn credentials' });
//             }
//         } else {
//             console.warn('No valid authentication method provided');
//             return response.status(400).json({ error: 'No valid authentication method provided' });
//         }

//         //Encrypted User Id
//         const encryptedUserId = security.encrypt(user.id)

//         // Generate token
//         console.log('Generating JWT token...');
//         // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         const token = jwt.sign({ id: encryptedUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
//         console.log('JWT token generated:', token);

//         response.status(200).json({
//             message: 'Sign in successful',
//             token,
//             expiresIn: 3600,
//             user: { id: encryptedUserId, username: user.username }
//             // user: { id: user.id, username: user.username }
//         });
//         console.log('Sign-in response sent for user:', user.username);

//     } catch (error) {
//         console.error('Unhandled error during sign-in:', error);
//         response.status(500).json({ error: error.message });
//     }
// }

// // Update failed attempts
// async function updateFailedAttempts(user, identifier) {
//     console.log('Incrementing failed login attempts for user:', user.username);

//     user.failedLoginAttempts += 1;
//     user.lastFailedLogin = new Date();
//     await user.save();

//     console.warn('Failed login attempts updated. Total attempts:', user.failedLoginAttempts);

//     if (user.failedLoginAttempts >= 3) {
//         user.accountLocked = true;
//         await user.save();
//         console.error('Account locked due to too many failed attempts:', user.username);
//         throw new Error('Account is locked due to too many failed attempts. Try again later.');
//     }
// }

// module.exports = signIn;


