const sgMail = require('@sendgrid/mail');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/userModels');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);


//Function to send email
async function sendResetEmail (to, subject, text, html) {
    const message = {
        to,
        from: 'diandremiller@pursuit.org',
        subject,
        text,
        html,
    };

    try {
        await sgMail.send(message);
        console.log('Email was sent');
    } catch (error) {
        console.error('There was an error sending the email');

        if(error.response) {
            console.error('SendGrid Response Error:', error.response.body);
        }
        throw new Error('Failed to send password reset email');
    }
}


//Function to reset password
async function requestPasswordReset (email) {

    try {
        const user = await User.findOne({ where: { email } } )
        if(!user) {
            console.warn('This email does not exist');
            return;
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpires = new Date(Date.now() + 3600000)

        user.resetToken = resetToken;
        user.resetTokenExpires = resetTokenExpires;

        await user.save();

        console.log('Generated reset token for user:', email);

        //Create reset link
        const resetLink = `${process.env.FRONTEND_URL_LOCAL}/reset-password?token=${resetToken}`;
        const resetLinkDeployed = `${process.env.FRONTEND_URL_DEPLOYED}/reset-password?token=${resetToken}`;

        // Send reset email
        const subject = 'Password Reset Request';
        // const text = `Click the link to reset your password: ${resetLink}`;
        const text = `Click the link to reset your password: ${resetLinkDeployed}`;
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f7f7f7;
                    margin: 0;
                    padding: 0;
                    color: #333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: black;
                    margin: -20px;
                    text-align: center;
                    color: white;
                }
                .header img {
                    max-width: 100px;
                    border-radius: 50%;
                }
                .header h1 {
                    font-size: 24px;
                    margin: 10px 0;
                }
                .content {
                    padding: 20px;
                }
                .content p {
                    font-size: 16px;
                    line-height: 1.6;
                }
                .content a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    font-weight: bold;
                    border-radius: 5px;
                }
                .content a:hover {
                    background-color: #45a049;
                }
                .footer {
                    text-align: center;
                    padding: 10px;
                    background-color: #f1f1f1;
                    color: #666;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div class="email-container">
                <div class="header">
                    <img src="https://icapital-frontend.netlify.app/assets/wealthWise-DA0ZoQYP.png" alt="WealthWise Logo">
                    <h1>WealthWise</h1>
                </div>
                <div class="content">
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your WealthWise account. Please click the button below to reset your password:</p>
                    <a href="${resetLinkDeployed}" target="_blank">Reset Password</a>
                    <p>This link will expire in 1 hour. If you did not request this, please ignore this email.</p>
                </div>
                <div class="footer">
                    &copy; 2025 WealthWise. All rights reserved.
                </div>
            </div>
        </body>
        </html>
        `;
        
        await sendResetEmail(email, subject, text, html);

    } catch (error) {
        console.error('Error in requestPasswordReset:', error.message);
        throw new Error('Failed to process password reset request');
    }
}


async function resetPassword(token, newPassword) {
    try {

        // Find user by reset token
        const user = await User.findOne({ where: { resetToken: token } });

        if (!user || new Date() > new Date(user.resetTokenExpires)) {
            throw new Error('Invalid or expired reset token');
        }

        console.log('Valid reset token for user:', user.email);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpires = null;
        await user.save();

        console.log('Password reset successfully for user:', user.email);
    } catch (error) {
        console.error('Error in resetPassword:', error.message);
        throw new Error('Failed to reset password');
    }
}


module.exports = { sendResetEmail, requestPasswordReset, resetPassword };