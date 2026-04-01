const logger = require('../utils/logger');
const ResponseUtil = require('../utils/response');
const pool = require('../config/database');

const errorHandler = async (err, req, res, next) => {
    logger.error('Error occurred:', {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        user: req.user?.id
    });

    try {
        await pool.execute(
            `INSERT INTO error_logs (level, module, message, context, stack_trace) 
             VALUES (?, ?, ?, ?, ?)`,
            [
                'error',
                'api',
                err.message,
                JSON.stringify({ url: req.url, method: req.method, user: req.user?.id }),
                err.stack
            ]
        );
    } catch (dbErr) {
        logger.error('Failed to save error log:', dbErr);
    }

    if (err.name === 'ValidationError') {
        return ResponseUtil.error(res, err.message, 400, 400);
    }

    if (err.name === 'UnauthorizedError') {
        return ResponseUtil.unauthorized(res);
    }

    return ResponseUtil.serverError(res, '服务器内部错误');
};

module.exports = errorHandler;
