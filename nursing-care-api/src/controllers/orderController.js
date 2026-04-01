const OrderService = require('../services/orderService');
const ResponseUtil = require('../utils/response');

class OrderController {
    static async create(req, res, next) {
        try {
            const patientId = req.user.id;
            const order = await OrderService.createOrder(patientId, req.body);
            return ResponseUtil.success(res, order, '订单创建成功');
        } catch (error) {
            next(error);
        }
    }

    static async accept(req, res, next) {
        try {
            const nurseId = req.user.id;
            const orderId = req.params.id;
            const order = await OrderService.acceptOrder(orderId, nurseId);
            return ResponseUtil.success(res, order, '接单成功');
        } catch (error) {
            next(error);
        }
    }

    static async getDetail(req, res, next) {
        try {
            const { id } = req.params;
            const { id: userId, role } = req.user;
            const order = await OrderService.getOrderDetail(id, userId, role);
            return ResponseUtil.success(res, order);
        } catch (error) {
            next(error);
        }
    }

    static async getMyOrders(req, res, next) {
        try {
            const patientId = req.user.id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const orders = await OrderService.getPatientOrders(patientId, page, limit);
            return ResponseUtil.success(res, orders);
        } catch (error) {
            next(error);
        }
    }

    static async getPendingList(req, res, next) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const orders = await OrderService.getPendingOrders(page, limit);
            return ResponseUtil.success(res, orders);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = OrderController;
