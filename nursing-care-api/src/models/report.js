const pool = require('../config/database');

class ReportModel {
    static async create(reportData) {
        const {
            orderId,
            nurseId,
            patientCondition,
            careContent,
            medicationRecord,
            suggestions,
            attachments
        } = reportData;

        const [result] = await pool.execute(
            `INSERT INTO reports 
             (order_id, nurse_id, patient_condition, care_content, 
              medication_record, suggestions, attachments) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orderId, nurseId, patientCondition, careContent, 
             medicationRecord, suggestions, JSON.stringify(attachments || [])]
        );

        return result.insertId;
    }

    static async findByOrderId(orderId) {
        const [rows] = await pool.execute(
            `SELECT r.*, n.name as nurse_name, o.order_no
             FROM reports r
             JOIN users n ON r.nurse_id = n.id
             JOIN orders o ON r.order_id = o.id
             WHERE r.order_id = ? LIMIT 1`,
            [orderId]
        );
        return rows[0] || null;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT r.*, n.name as nurse_name, o.order_no
             FROM reports r
             JOIN users n ON r.nurse_id = n.id
             JOIN orders o ON r.order_id = o.id
             WHERE r.id = ? LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    }
}

module.exports = ReportModel;
