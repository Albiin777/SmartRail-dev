const crypto = require('crypto');

// Use a secure key and IV in production. 
// For this demo, we can derive a key from a secret or use a fixed one if environment variables aren't set.
const algorithm = 'aes-256-cbc';
const secretKey = process.env.ENCRYPTION_KEY ? Buffer.from(process.env.ENCRYPTION_KEY, 'hex') : crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

// Note: In a real app, Store the IV alongside the encrypted data (e.g., "iv:encryptedText") 
// or use a deterministic IV if needed (less secure for some modes).
// Here we will prepend IV to the encrypted string.

const encrypt = (text) => {
    if (!text) return null;
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

const decrypt = (text) => {
    if (!text) return null;
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
};

module.exports = { encrypt, decrypt };
