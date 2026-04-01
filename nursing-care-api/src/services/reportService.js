const ReportModel = require('../models/report');
const OrderModel = require('../models/order');
const logger = require('../utils/logger');

class ReportService {
    static async createReport(nurseId, reportData) {
        const { orderId } = reportData;
        
        const order = await OrderModel.findById(orderId);
        
        if (!order) {
            throw new Error('订单不存在');
        }

        if (order.nurse_id !== nurseId) {
            throw new Error('只能为已接单的订单创建报告');
        }

        if (order.status !== 'accepted' && order.status !== 'in_progress') {
            throw new Error('订单状态不允许创建报告');
        }

        const existingReport = await ReportModel.findByOrderId(orderId);
        if (existingReport) {
            throw new Error('该订单已存在护理报告');
        }

        const reportId = await ReportModel.create({
            ...reportData,
            nurseId
        });

        await OrderModel.updateStatus(orderId, 'completed');

        logger.info('Report created', { 
            reportId, 
            orderId, 
            nurseId 
        });

        return await ReportModel.findById(reportId);
    }

    static async getReportByOrderId(orderId, userId, userRole) {
        const order = await OrderModel.findById(orderId);
        
        if (!order) {
            throw new Error('订单不存在');
        }

        if (userRole !== 'admin' && 
            order.patient_id !== userId && 
            order.nurse_id !== userId) {
            throw new Error('无权查看此报告');
        }

        const report = await ReportModel.findByOrderId(orderId);
        
        if (!report) {
            throw new Error('报告不存在');
        }

        if (report.attachments) {
            report.attachments = JSON.parse(report.attachments);
        }

        return report;
    }
}

module.exports = ReportService;
