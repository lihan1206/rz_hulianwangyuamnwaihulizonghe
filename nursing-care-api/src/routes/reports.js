const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/reportController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validate, createReportValidation } = require('../middleware/validator');

router.post('/', 
    authMiddleware, 
    roleMiddleware(['nurse']), 
    validate(createReportValidation), 
    ReportController.create
);

router.get('/order/:orderId', authMiddleware, ReportController.getByOrderId);

module.exports = router;
