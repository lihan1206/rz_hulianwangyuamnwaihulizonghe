const jwt = require('jsonwebtoken');
const config = require('../config');
const ResponseUtil = require('../utils/response');

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return ResponseUtil.unauthorized(res, '请先登录');
    }

    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return ResponseUtil.unauthorized(res, '登录已过期，请重新登录');
    }
};

const roleMiddleware = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return ResponseUtil.unauthorized(res);
        }
        
        if (!roles.includes(req.user.role)) {
            return ResponseUtil.forbidden(res, '无权限执行此操作');
        }
        
        next();
    };
};

module.exports = { authMiddleware, roleMiddleware };
