-- 確保使用 InnoDB 引擎以支援外鍵
SET FOREIGN_KEY_CHECKS = 0;

-- 刪除現有表（如果存在），以避免衝突
DROP TABLE IF EXISTS items;
DROP TABLE IF EXISTS carts;
DROP TABLE IF EXISTS shops;
DROP TABLE IF EXISTS users;

-- 創建 users 表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) UNIQUE NOT NULL,
    password VARCHAR(120) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 創建 shops 表
CREATE TABLE shops (
    shop_id INT AUTO_INCREMENT PRIMARY KEY,
    shop_name VARCHAR(100) NOT NULL,
    hasdelivery BOOLEAN DEFAULT FALSE,
    luanch_time TIME NOT NULL
) ENGINE=InnoDB;

-- 創建 carts 表
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    shop_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (shop_id) REFERENCES shops(shop_id) ON DELETE CASCADE
) ENGINE=InnoDB;


-- 恢復外鍵檢查
SET FOREIGN_KEY_CHECKS = 1;