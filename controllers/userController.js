'use strict';

const User = require('../models/userModels');

async function getUser(request, response) {
    try {
        const { id } = request.params;

        if (!id) {
            return response.status(400).json({ error: 'User ID is required' });
        }

        const user = await User.findByPk(id, {
            attributes: { exclude: ['password', 'webauthnpublickey'] } 
        });

        if (!user) {
            return response.status(404).json({ error: 'User not found' });
        }
        response.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        response.status(500).json({ error: 'An error occurred while fetching the user' });
    }
}

module.exports = { getUser };
