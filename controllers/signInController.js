'use strict';

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModels');
const { Op } = require('sequelize');
const { server } = require('@passwordless-id/webauthn');

// Sign In
async function signIn(request, response) {
    try {
        console.log('Received sign-in request body:', request.body);

        const { identifier, password, webauthnCredential } = request.body;

        // Check if identifier is provided
        if (!identifier) {
            return response.status(400).json({ error: 'Email, username, or phone number is required' });
        }

        console.log('Sign-in request received:', identifier);

        // Check if user exists
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
            console.error('Invalid login credentials for identifier:', identifier);
            return response.status(401).json({ error: 'Invalid login credentials' });
        }

        // Check if user account is locked
        if (user.accountLocked) {
            const lockOutEnd = new Date(user.lastFailedLogin);
            lockOutEnd.setHours(lockOutEnd.getHours() + 6);
            console.log('Account locked. Lockout ends at:', lockOutEnd.toLocaleString());

            if (new Date() < lockOutEnd) {
                const formattedLoginTime = lockOutEnd.toLocaleString();
                return response.status(403).json({ error: `Account is locked, please try again at ${formattedLoginTime}` });
            } else {
                // Reset account lock if the lockout period has passed
                user.failedLoginAttempts = 0;
                user.accountLocked = false;
                await user.save();
                console.log('Account unlocked, failed attempts reset.');
            }
        }

        // Check if user is signing in with a password or WebAuthn
        if (password) {
            // User is signing in with password
            console.log('Password received for verification:', password);
            console.log('Stored hashed password:', user.password);
            
            // Check password
            const passwordMatch = await bcrypt.compare(password.trim(), user.password.trim());
            if (!passwordMatch) {
                await updateFailedAttempts(user, identifier);
                return response.status(401).json({ error: 'Invalid login credentials' });
            }

            // Successful login with password
            user.failedLoginAttempts = 0;
            await user.save();
            console.log('User logged in successfully with password:', user.username);
        } else if (webauthnCredential) {
            const challenge = user.challenge;
            console.log('Challenge retrieved for user:', challenge);

            // Verify WebAuthn credential
            try {
                const authenticationParsed = await server.verifyAuthentication(webauthnCredential, {
                    publicKey: user.webauthnPublicKey,
                    challenge,
                    origin: request.headers.origin,
                    userVerified: true,
                    counter: user.authCounter,
                });

                // Update the authentication counter with the value from authenticationParsed
                user.authCounter = authenticationParsed.counter || user.authCounter + 1; 
                user.challenge = null; // Reset challenge after successful authentication
                await user.save();
                console.log('User logged in successfully with WebAuthn:', user.username);
            } catch (error) {
                console.error('WebAuthn verification failed for identifier:', identifier, error);
                return response.status(401).json({ error: 'Invalid WebAuthn credentials' });
            }
        } else {
            return response.status(400).json({ error: 'No valid authentication method provided' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the response with the token and other relevant data
        response.status(200).json({ message: 'Sign in is a success', token,
             expiresIn: 3600, user: { id: user.id, username: user.username } });

    } catch (error) {
        console.error('Error during sign-in:', error);
        response.status(500).json({ error: error.message });
    }
}

// Update failed attempts
async function updateFailedAttempts(user, identifier) {
    user.failedLoginAttempts += 1;
    user.lastFailedLogin = new Date();
    await user.save();

    console.error('Incorrect attempt for identifier:', identifier);

    if (user.failedLoginAttempts >= 3) {
        user.accountLocked = true;
        await user.save();
        throw new Error('Account is locked due to too many failed attempts. Try again later.');
    }
}

module.exports = signIn;
