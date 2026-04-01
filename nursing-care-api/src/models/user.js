const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
    static async findByPhone(phone) {
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE phone = ? LIMIT 1',
            [phone]
        );
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            'SELECT id, phone, name, role, status, created_at FROM users WHERE id = ? LIMIT 1',
            [id]
        );
        return rows[0] || null;
    }

    static async create(userData) {
        const { phone, password, name, role = 'patient' } = userData;
        const passwordHash = await bcrypt.hash(password, 10);
        
        const [result] = await pool.execute(
            'INSERT INTO users (phone, password_hash, name, role) VALUES (?, ?, ?, ?)',
            [phone, passwordHash, name, role]
        );
        
        return result.insertId;
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = UserModel;
