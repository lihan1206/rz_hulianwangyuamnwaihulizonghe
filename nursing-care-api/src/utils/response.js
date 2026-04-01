class ResponseUtil {
    static success(res, data = null, message = '操作成功') {
        return res.json({
            code: 0,
            message,
            data,
            timestamp: Date.now()
        });
    }

    static error(res, message = '操作失败', code = 1, statusCode = 200) {
        return res.status(statusCode).json({
            code,
            message,
            data: null,
            timestamp: Date.now()
        });
    }

    static unauthorized(res, message = '未授权') {
        return this.error(res, message, 401, 401);
    }

    static forbidden(res, message = '无权限') {
        return this.error(res, message, 403, 403);
    }

    static notFound(res, message = '资源不存在') {
        return this.error(res, message, 404, 404);
    }

    static serverError(res, message = '服务器内部错误') {
        return this.error(res, message, 500, 500);
    }
}

module.exports = ResponseUtil;
