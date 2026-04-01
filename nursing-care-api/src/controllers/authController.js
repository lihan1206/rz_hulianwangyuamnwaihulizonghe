const AuthService = require('../services/authService');
const ResponseUtil = require('../utils/response');

class AuthController {
    static async login(req, res, next) {
        try {
            const { phone, password } = req.body;
            const result = await AuthService.login(phone, password);
            return ResponseUtil.success(res, result, '登录成功');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
