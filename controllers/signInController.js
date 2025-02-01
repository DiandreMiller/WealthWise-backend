'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');
const security = require('../utils/encryption');
const { Op } = require('sequelize');
const { server } = require('@passwordless-id/webauthn');

// Sign In
async function signIn(request, response) {
    try {
        console.log('Received sign-in request body:', request.body);

        const { identifier, password, webauthnCredential } = request.body;

        // Check if identifier is provided
        if (!identifier) {
            console.warn('Identifier is missing in request body');
            return response.status(400).json({ error: 'Email, username, or phone number is required' });
        }

        console.log('Sign-in request received with identifier:', identifier);

        // Check if user exists
        console.log('Querying database for user...');
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { email: identifier },
                    { username: identifier },
                    { phoneNumber: identifier }
                ]
            }
        });

        if (!user) {
            console.error('No user found for identifier:', identifier);
            return response.status(401).json({ error: 'Invalid login credentials' });
        }
        console.log('User found:', user.username);

        // Check if user account is locked
        if (user.accountLocked) {
            console.log('User account is locked. Checking lockout period...');
            const lockOutEnd = new Date(user.lastFailedLogin);
            lockOutEnd.setHours(lockOutEnd.getHours() + 6);
            // lockOutEnd.setMinutes(lockOutEnd.getMinutes() + 1)
            console.log('Lockout end time:', lockOutEnd.toISOString());

            if (new Date() < lockOutEnd) {
                console.warn('Account still locked. Current time:', new Date().toISOString());
                return response.status(403).json({ error: `Account is locked, please try again at ${lockOutEnd.toLocaleString()}` });
            } else {
                console.log('Lockout period has expired. Unlocking account...');
                user.failedLoginAttempts = 0;
                user.accountLocked = false;
                await user.save();
                console.log('Account unlocked successfully');
            }
        }

        // Determine authentication method
        if (password) {
            console.log('Password provided for authentication');
            console.log('Stored hashed password for user:', user.password);

            const passwordMatch = await bcrypt.compare(password.trim(), user.password.trim());
            // const passwordMatch = await bcrypt.compare(password, user.password);

            console.log('Password comparison result:', passwordMatch);

            if (!passwordMatch) {
                console.warn('Password mismatch for user:', user.username);
                await updateFailedAttempts(user, identifier);
                return response.status(401).json({ error: 'Invalid login credentials' });
            }

            console.log('Password authentication successful for user:', user.username);
            user.failedLoginAttempts = 0;
            await user.save();
        } else if (webauthnCredential) {
            console.log('WebAuthn credential provided. Verifying...');

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
                await user.save();
                console.log('Updated user authentication counter and reset challenge');
            } catch (error) {
                console.error('WebAuthn verification failed:', error);
                return response.status(401).json({ error: 'Invalid WebAuthn credentials' });
            }
        } else {
            console.warn('No valid authentication method provided');
            return response.status(400).json({ error: 'No valid authentication method provided' });
        }

        //Encrypted User Id
        const encryptedUserId = security.encrypt(user.id)

        // Generate token
        console.log('Generating JWT token...');
        // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const token = jwt.sign({ id: encryptedUserId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('JWT token generated:', token);

        response.status(200).json({
            message: 'Sign in successful',
            token,
            expiresIn: 3600,
            user: { id: encryptedUserId, username: user.username }
            // user: { id: user.id, username: user.username }
        });
        console.log('Sign-in response sent for user:', user.username);

    } catch (error) {
        console.error('Unhandled error during sign-in:', error);
        response.status(500).json({ error: error.message });
    }
}

// Update failed attempts
async function updateFailedAttempts(user, identifier) {
    console.log('Incrementing failed login attempts for user:', user.username);

    user.failedLoginAttempts += 1;
    user.lastFailedLogin = new Date();
    await user.save();

    console.warn('Failed login attempts updated. Total attempts:', user.failedLoginAttempts);

    if (user.failedLoginAttempts >= 3) {
        user.accountLocked = true;
        await user.save();
        console.error('Account locked due to too many failed attempts:', user.username);
        throw new Error('Account is locked due to too many failed attempts. Try again later.');
    }
}

module.exports = signIn;
