const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');
const config = require('../config');
const logger = require('../utils/logger');

class AuthService {
    static async login(phone, password) {
        const user = await UserModel.findByPhone(phone);
        
        if (!user) {
            logger.warn('Login failed: user not found', { phone });
            throw new Error('手机号或密码错误');
        }

        if (user.status !== 1) {
            logger.warn('Login failed: user disabled', { phone, userId: user.id });
            throw new Error('账号已被禁用');
        }

        const isValidPassword = await UserModel.verifyPassword(password, user.password_hash);
        
        if (!isValidPassword) {
            logger.warn('Login failed: invalid password', { phone, userId: user.id });
            throw new Error('手机号或密码错误');
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                phone: user.phone, 
                role: user.role,
                name: user.name
            },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        logger.info('Login success', { userId: user.id, phone });

        return {
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                role: user.role
            }
        };
    }
}

module.exports = AuthService;
