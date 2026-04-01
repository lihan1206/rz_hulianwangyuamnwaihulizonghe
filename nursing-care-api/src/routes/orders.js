const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const { validate, createOrderValidation, acceptOrderValidation } = require('../middleware/validator');

router.post('/', 
    authMiddleware, 
    roleMiddleware(['patient']), 
    validate(createOrderValidation), 
    OrderController.create
);

router.patch('/:id/accept', 
    authMiddleware, 
    roleMiddleware(['nurse']), 
    validate(acceptOrderValidation), 
    OrderController.accept
);

router.get('/:id', authMiddleware, OrderController.getDetail);

router.get('/', authMiddleware, roleMiddleware(['patient']), OrderController.getMyOrders);

router.get('/list/pending', 
    authMiddleware, 
    roleMiddleware(['nurse']), 
    OrderController.getPendingList
);

module.exports = router;
