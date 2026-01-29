const db = require('../config/db');

const createUser = async (username, email, password) => {
    await db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, password]
    );
};

const findByEmail = async (email) => {
    const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
    );
    return rows[0];
};

module.exports = { createUser, findByEmail };