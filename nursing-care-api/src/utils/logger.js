const winston = require('winston');
const config = require('../config');
const pool = require('../config/database');

class DatabaseTransport extends winston.Transport {
    constructor(opts) {
        super(opts);
    }

    async log(info, callback) {
        setImmediate(() => this.emit('logged', info));

        try {
            if (info.level === 'error' || info.level === 'warn') {
                await pool.execute(
                    `INSERT INTO error_logs (level, module, message, context, stack_trace) 
                     VALUES (?, ?, ?, ?, ?)`,
                    [
                        info.level === 'warn' ? 'warning' : 'error',
                        info.service || 'api',
                        info.message,
                        JSON.stringify({
                            ...info,
                            message: undefined,
                            level: undefined,
                            timestamp: undefined
                        }),
                        info.stack || null
                    ]
                );
            }
        } catch (err) {
            console.error('Failed to save log to database:', err);
        }

        callback();
    }
}

const logger = winston.createLogger({
    level: config.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
    ),
    defaultMeta: { service: 'nursing-care-api' },
    transports: [
        new winston.transports.File({ 
            filename: 'logs/error.log', 
            level: 'error',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new winston.transports.File({ 
            filename: 'logs/combined.log',
            maxsize: 5242880,
            maxFiles: 5
        }),
        new DatabaseTransport()
    ]
});

if (config.nodeEnv !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
        )
    }));
}

logger.reportBusinessError = async (type, data) => {
    const errorTypes = {
        ORDER_TIMEOUT: '订单超时未完成',
        PAYMENT_FAILED: '支付失败',
        NURSE_NO_SHOW: '护理人员未到场',
        SYSTEM_ERROR: '系统错误'
    };

    logger.error(`[BUSINESS_ERROR] ${errorTypes[type] || type}`, {
        type,
        ...data,
        timestamp: new Date().toISOString()
    });
};

logger.reportOrderTimeout = async (order) => {
    logger.reportBusinessError('ORDER_TIMEOUT', {
        orderId: order.id,
        orderNo: order.order_no,
        patientId: order.patient_id,
        scheduledTime: order.scheduled_time,
        hoursDelayed: Math.floor((Date.now() - new Date(order.scheduled_time)) / 3600000)
    });
};

module.exports = logger;
