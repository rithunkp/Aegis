-- Create database
CREATE DATABASE IF NOT EXISTS aegis_expense_tracker;
USE aegis_expense_tracker;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    amount DECIMAL(10, 2) NOT NULL,
    description TEXT,
    tag VARCHAR(50) NOT NULL,
    type ENUM('expense', 'income') DEFAULT 'expense',
    time BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_time (user_id, time),
    INDEX idx_tag (tag)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    name VARCHAR(50) NOT NULL,
    emoji VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_tag (user_id, name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT DEFAULT 1,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    UNIQUE KEY unique_user_setting (user_id, setting_key),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default user
INSERT INTO users (username) VALUES ('User') ON DUPLICATE KEY UPDATE username=username;

-- Insert default tags
INSERT INTO tags (user_id, name, emoji) VALUES 
    (1, 'Food', '🍽️'),
    (1, 'Shopping', '🛍️'),
    (1, 'Transport', '🚗'),
    (1, 'Entertainment', '🎬'),
    (1, 'Bills', '💡'),
    (1, 'Healthcare', '🏥'),
    (1, 'Income', '💰')
ON DUPLICATE KEY UPDATE emoji=VALUES(emoji);
