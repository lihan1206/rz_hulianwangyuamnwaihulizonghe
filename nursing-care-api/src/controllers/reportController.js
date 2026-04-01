const ReportService = require('../services/reportService');
const ResponseUtil = require('../utils/response');

class ReportController {
    static async create(req, res, next) {
        try {
            const nurseId = req.user.id;
            const report = await ReportService.createReport(nurseId, req.body);
            return ResponseUtil.success(res, report, '护理报告上传成功');
        } catch (error) {
            next(error);
        }
    }

    static async getByOrderId(req, res, next) {
        try {
            const { orderId } = req.params;
            const { id: userId, role } = req.user;
            const report = await ReportService.getReportByOrderId(orderId, userId, role);
            return ResponseUtil.success(res, report);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ReportController;
