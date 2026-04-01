const { body, param, validationResult } = require('express-validator');
const ResponseUtil = require('../utils/response');

const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }

        const errorMessages = errors.array().map(err => err.msg).join(', ');
        return ResponseUtil.error(res, errorMessages, 400, 400);
    };
};

const loginValidation = [
    body('phone')
        .notEmpty().withMessage('手机号不能为空')
        .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确'),
    body('password')
        .notEmpty().withMessage('密码不能为空')
        .isLength({ min: 6 }).withMessage('密码至少6位')
];

const createOrderValidation = [
    body('serviceType').notEmpty().withMessage('服务类型不能为空'),
    body('address').notEmpty().withMessage('地址不能为空'),
    body('contactPhone')
        .notEmpty().withMessage('联系电话不能为空')
        .matches(/^1[3-9]\d{9}$/).withMessage('联系电话格式不正确'),
    body('scheduledTime')
        .notEmpty().withMessage('预约时间不能为空')
        .isISO8601().withMessage('预约时间格式不正确'),
    body('durationHours')
        .notEmpty().withMessage('服务时长不能为空')
        .isInt({ min: 1, max: 24 }).withMessage('服务时长必须在1-24小时之间'),
    body('amount')
        .notEmpty().withMessage('金额不能为空')
        .isDecimal({ decimal_digits: '0,2' }).withMessage('金额格式不正确')
];

const acceptOrderValidation = [
    param('id').isInt().withMessage('订单ID格式不正确')
];

const createReportValidation = [
    body('orderId').notEmpty().withMessage('订单ID不能为空').isInt(),
    body('patientCondition').notEmpty().withMessage('患者状况不能为空'),
    body('careContent').notEmpty().withMessage('护理内容不能为空')
];

module.exports = {
    validate,
    loginValidation,
    createOrderValidation,
    acceptOrderValidation,
    createReportValidation
};
