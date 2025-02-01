//TODO: Figure out a way to generate a random user id each time the user logs in

const crypto = require('crypto');

const algorithm = 'aes-256-cbc'; 
const key = Buffer.from(process.env.ENCRYPTION_KEY, 'base64'); 
const iv = Buffer.from(process.env.ENCRYPTION_IV, 'base64'); 


// Encryption function
function encrypt(text) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

// Decryption function
function decrypt(encryptedText) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// const plainText = 'This is a secret message.';
// const encryptedText = encrypt(plainText);
// const decryptedText = decrypt(encryptedText);

// console.log('Plain text:', plainText);
// console.log('Encrypted text:', encryptedText);
// console.log('Decrypted text:', decryptedText);

module.exports = {
    encrypt,
    decrypt,
};