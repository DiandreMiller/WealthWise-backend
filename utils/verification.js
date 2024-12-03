// utils/verification.js
const { verifyAuthenticationResponse } = require('@simplewebauthn/server');

/**
 * Verifies the authentication response.
 * 
 * @param {Object} params - The parameters for verification.
 * @param {Object} params.data - The response data from the client.
 * @param {string} params.expectedChallenge - The expected challenge.
 * @param {string} params.expectedOrigin - The expected origin.
 * @param {string} params.expectedRPID - The expected relying party ID.
 * @param {Object} params.authenticator - The user's authenticator data.
 * @returns {Promise<Object>} - The verification result.
 */
async function verifyUserAuthentication({ data, expectedChallenge, expectedOrigin, expectedRPID, authenticator }) {
    try {
        const verification = await verifyAuthenticationResponse({
            response: data,
            expectedChallenge: expectedChallenge,
            expectedOrigin: expectedOrigin,
            expectedRPID: expectedRPID,
            authenticator: {
                credentialID: authenticator.credentialID,
                publicKey: authenticator.publicKey,
                counter: authenticator.counter,
                requiredUserVerification: false,
            },
        });

        return verification;
    } catch (error) {
        throw new Error(`Verification failed: ${error.message}`);
    }
}

module.exports = {
    verifyUserAuthentication,
};
