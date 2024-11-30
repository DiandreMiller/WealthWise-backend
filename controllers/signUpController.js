'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModels');
const createSignUpSchema = require('../validations/userValidationsSignUp'); 
const { sequelize } = require('../config/database');

const generateToken = (user) => {
  
    const payload = {
        id: user.id,
        username: user.username,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
    };

    const secret = process.env.JWT_SECRET; 
    const options = { expiresIn: '1h' }; 
    return jwt.sign(payload, secret, options);
}

// Sign Up
async function signUp(request, response) {
    console.log('User Model:', User);
    try {
        console.log('Received request:', request.body);

        // Validate request data
        const { error } = createSignUpSchema().validate(request.body);
        if (error) {
            return response.status(400).json({ error: error.details[0].message });
        }

        const { username, email, password, dateOfBirth, phoneNumber, webauthnid, webauthnpublickey } = request.body;

        // Check if user already exists by email, username, or phone number
        const existingUser = await User.findOne({
            where: sequelize.or(
                { email: email.toLowerCase() },
                { username },
                // { phoneNumber }  
            )
        });

        if (existingUser) {
            return response.status(409).json({ error: 'User already exists with this identifier' });
        }

        // Hash password
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('Hashed Password:', hashedPassword);

        // Create user in a transaction
        const user = await sequelize.transaction(async (t) => {
            return await User.create({
                username,
                email,
                password: hashedPassword,
                dateOfBirth,
                phoneNumber,
                webauthnid, 
                webauthnpublickey,
                authCounter: 0
            }, { transaction: t });
        });

        // Generate JWT token
        const token = generateToken(user);

        response.status(201).json({ message: 'User created', user: { id: user.id, username: user.username, email: user.email, token } });
    } catch (error) {
        console.error('Sign Up Error:', error);
        response.status(500).json({ error: error.message });
    }
}

module.exports = signUp;


