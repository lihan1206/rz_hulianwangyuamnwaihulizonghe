-- 用户表
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    name VARCHAR(50) NOT NULL COMMENT '姓名',
    role ENUM('patient', 'nurse', 'admin') NOT NULL DEFAULT 'patient' COMMENT '角色',
    status TINYINT NOT NULL DEFAULT 1 COMMENT '状态: 0-禁用, 1-启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_phone (phone),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 订单表
CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(32) NOT NULL UNIQUE COMMENT '订单编号',
    patient_id BIGINT UNSIGNED NOT NULL COMMENT '患者ID',
    nurse_id BIGINT UNSIGNED NULL COMMENT '护理人员ID',
    service_type VARCHAR(50) NOT NULL COMMENT '服务类型',
    address TEXT NOT NULL COMMENT '服务地址',
    contact_phone VARCHAR(20) NOT NULL COMMENT '联系电话',
    scheduled_time DATETIME NOT NULL COMMENT '预约时间',
    duration_hours INT UNSIGNED NOT NULL COMMENT '服务时长(小时)',
    amount DECIMAL(10,2) NOT NULL COMMENT '订单金额',
    status ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled', 'timeout') 
        NOT NULL DEFAULT 'pending' COMMENT '订单状态',
    remark TEXT NULL COMMENT '备注',
    accepted_at DATETIME NULL COMMENT '接单时间',
    completed_at DATETIME NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_patient_id (patient_id),
    INDEX idx_nurse_id (nurse_id),
    INDEX idx_status (status),
    INDEX idx_scheduled_time (scheduled_time),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    FOREIGN KEY (nurse_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 护理报告表
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
    nurse_id BIGINT UNSIGNED NOT NULL COMMENT '护理人员ID',
    patient_condition TEXT NOT NULL COMMENT '患者状况',
    care_content TEXT NOT NULL COMMENT '护理内容',
    medication_record TEXT NULL COMMENT '用药记录',
    suggestions TEXT NULL COMMENT '护理建议',
    attachments JSON NULL COMMENT '附件URL列表',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_nurse_id (nurse_id),
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (nurse_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='护理报告表';

-- 错误日志表
CREATE TABLE error_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    level ENUM('error', 'warning', 'info') NOT NULL DEFAULT 'error',
    module VARCHAR(50) NOT NULL COMMENT '模块',
    message TEXT NOT NULL COMMENT '错误信息',
    context JSON NULL COMMENT '上下文信息',
    stack_trace TEXT NULL COMMENT '堆栈信息',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_level (level),
    INDEX idx_module (module),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='错误日志表';

-- 部署日志表
CREATE TABLE deployment_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(20) NOT NULL COMMENT '版本号',
    commit_hash VARCHAR(40) COMMENT 'Git commit hash',
    build_time TIMESTAMP NULL COMMENT '构建时间',
    deploy_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '部署时间',
    node_version VARCHAR(20) COMMENT 'Node.js版本',
    INDEX idx_deploy_time (deploy_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='部署日志表';
