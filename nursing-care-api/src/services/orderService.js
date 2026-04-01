const OrderModel = require('../models/order');
const logger = require('../utils/logger');

class OrderService {
    static async createOrder(patientId, orderData) {
        const order = await OrderModel.create({
            patientId,
            ...orderData
        });

        logger.info('Order created', { 
            orderId: order.id, 
            orderNo: order.orderNo, 
            patientId 
        });

        return order;
    }

    static async acceptOrder(orderId, nurseId) {
        const order = await OrderModel.findById(orderId);
        
        if (!order) {
            throw new Error('订单不存在');
        }

        if (order.status !== 'pending') {
            throw new Error('订单已被接单或已取消');
        }

        if (order.nurse_id === nurseId) {
            throw new Error('不能接自己的订单');
        }

        const success = await OrderModel.acceptOrder(orderId, nurseId);
        
        if (!success) {
            throw new Error('接单失败，请重试');
        }

        logger.info('Order accepted', { orderId, nurseId });

        return await OrderModel.findById(orderId);
    }

    static async getOrderDetail(orderId, userId, userRole) {
        const order = await OrderModel.findById(orderId);
        
        if (!order) {
            throw new Error('订单不存在');
        }

        if (userRole !== 'admin' && 
            order.patient_id !== userId && 
            order.nurse_id !== userId) {
            throw new Error('无权查看此订单');
        }

        return order;
    }

    static async getPatientOrders(patientId, page, limit) {
        return await OrderModel.findByPatientId(patientId, page, limit);
    }

    static async getPendingOrders(page, limit) {
        return await OrderModel.findPendingOrders(page, limit);
    }

    static async handleTimeoutOrders() {
        const timeoutOrders = await OrderModel.findTimeoutOrders();
        
        for (const order of timeoutOrders) {
            await OrderModel.updateStatus(order.id, 'timeout');
            logger.warn('Order timeout', { 
                orderId: order.id, 
                orderNo: order.order_no,
                scheduledTime: order.scheduled_time 
            });
        }

        return timeoutOrders.length;
    }
}

module.exports = OrderService;
