const pool = require('../config/database');

class OrderModel {
    static generateOrderNo() {
        const date = new Date();
        const prefix = date.getFullYear().toString() +
                      String(date.getMonth() + 1).padStart(2, '0') +
                      String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 900000 + 100000);
        return prefix + random;
    }

    static async create(orderData) {
        const orderNo = this.generateOrderNo();
        const {
            patientId,
            serviceType,
            address,
            contactPhone,
            scheduledTime,
            durationHours,
            amount,
            remark
        } = orderData;

        const [result] = await pool.execute(
            `INSERT INTO orders 
             (order_no, patient_id, service_type, address, contact_phone, 
              scheduled_time, duration_hours, amount, remark) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [orderNo, patientId, serviceType, address, contactPhone, 
             scheduledTime, durationHours, amount, remark]
        );

        return { id: result.insertId, orderNo };
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT o.*, 
                    p.name as patient_name, p.phone as patient_phone,
                    n.name as nurse_name, n.phone as nurse_phone
             FROM orders o
             LEFT JOIN users p ON o.patient_id = p.id
             LEFT JOIN users n ON o.nurse_id = n.id
             WHERE o.id = ? LIMIT 1`,
            [id]
        );
        return rows[0] || null;
    }

    static async findByOrderNo(orderNo) {
        const [rows] = await pool.execute(
            'SELECT * FROM orders WHERE order_no = ? LIMIT 1',
            [orderNo]
        );
        return rows[0] || null;
    }

    static async acceptOrder(orderId, nurseId) {
        const [result] = await pool.execute(
            `UPDATE orders 
             SET nurse_id = ?, status = 'accepted', accepted_at = NOW() 
             WHERE id = ? AND status = 'pending'`,
            [nurseId, orderId]
        );
        return result.affectedRows > 0;
    }

    static async findByPatientId(patientId, page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.execute(
            `SELECT o.*, n.name as nurse_name 
             FROM orders o
             LEFT JOIN users n ON o.nurse_id = n.id
             WHERE o.patient_id = ?
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?`,
            [patientId, limit, offset]
        );
        return rows;
    }

    static async findPendingOrders(page = 1, limit = 10) {
        const offset = (page - 1) * limit;
        const [rows] = await pool.execute(
            `SELECT o.*, p.name as patient_name, p.phone as patient_phone
             FROM orders o
             JOIN users p ON o.patient_id = p.id
             WHERE o.status = 'pending'
             AND o.scheduled_time > NOW()
             ORDER BY o.scheduled_time ASC
             LIMIT ? OFFSET ?`,
            [limit, offset]
        );
        return rows;
    }

    static async updateStatus(orderId, status) {
        const [result] = await pool.execute(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, orderId]
        );
        return result.affectedRows > 0;
    }

    static async findTimeoutOrders() {
        const [rows] = await pool.execute(
            `SELECT * FROM orders 
             WHERE status = 'pending' 
             AND scheduled_time < DATE_SUB(NOW(), INTERVAL 1 HOUR)`
        );
        return rows;
    }
}

module.exports = OrderModel;
