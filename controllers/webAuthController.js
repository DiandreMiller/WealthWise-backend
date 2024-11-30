const { server } = require('@passwordless-id/webauthn'); 

// Controller function to generate registration options
const generateRegistration = (request, response) => { 
    const { username } = request.body; 

    const rp = {
        name: 'Red Canary',
        id: String(process.env.EXPECTED_RPID),
    };

    console.log('Relying Party:', rp);

    // Generate a random challenge
    const challenge = server.randomChallenge();

    // Create the registration options object
    const options = {
        rp,
        user: {
            id: username, 
            name: username,
            displayName: username,
        },
        challenge,
        pubKeyCredParams: [{ type: "public-key", alg: -7 }], 
        timeout: 60000, 
        attestation: "direct", 
    };

    // Store the challenge in the session for later verification
    request.session.challenge = challenge;

    // Send the options back to the client
    response.json(options);
};

module.exports = generateRegistration;
