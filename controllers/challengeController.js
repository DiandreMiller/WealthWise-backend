const { getNewChallenge } = require('../utils/challenge');

const generateChallenge = (request, response) => {
    const { username } = request.body; 
    
    // Generate a new challenge
    const challenge = getNewChallenge();
    
    // Store the challenge in the session
    request.session.challenge = challenge;

    // Store the username in the session for later 
    request.session.username = username;

    // Send the challenge back to the client
    response.json({ challenge });
};

module.exports = generateChallenge;
