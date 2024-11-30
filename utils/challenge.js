const crypto = require('crypto');

const getNewChallenge = () => {
    const challengeBuffer = crypto.randomBytes(32);
    return challengeBuffer.toString('base64url');
}


const convertChallenge = (challenge) => {
    return new TextEncoder().encode(challenge);
};

module.exports = {
    getNewChallenge,
    convertChallenge,
};