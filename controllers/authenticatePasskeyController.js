'use strict';

const webauthn = require('@simplewebauthn/server'); 
const User = require('../models/userModels');
console.log('check user:', User);

exports.authenticatePasskey = async (request, response) => {
    const { credential } = request.body; 
    console.log('Credential ID:', credential.id);
    const user = await User.findByPk(credential.id); 
    console.log('User id:', user);

    if (!user) {
        return response.status(404).send('User not found 3');
    }

    const expectedChallenge = user.challenge.replace(/=*$/, '').replace(/\+/g, '-').replace(/\//g, '_');

    // Log both the original and the transformed challenges for debugging
    console.log('User challenge (from DB):', user.challenge);
    console.log('Expected challenge (URL-safe):', expectedChallenge);

    // Verify the credential
    try {
        const verification = await webauthn.verifyAuthenticationResponse({
            credential, 
            expectedChallenge: expectedChallenge,
            expectedOrigin: process.env.EXPECTED_ORIGIN, 
            expectedRPID: process.env.EXPECTED_RPID, 
            publicKey: user.publicKey, 
        });

        console.log('Verification result:', verification)

        if (verification.verified) {
            // Successful authentication
            response.status(200).send('Authentication successful');
        } else {
            // Authentication failed
            response.status(401).send('Authentication failed');
        }
    } catch (error) {
        console.error('Error verifying passkey:', error);
        response.status(500).send('Internal server error');
    }
};
