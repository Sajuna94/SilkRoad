CREATE SCHEMA `order`;

CREATE SCHEMA `auth`;

CREATE SCHEMA `store`;

-- order schema


-- store schema
DROP TABLE IF EXISTS `store`.`reviews`;



-- auth schema
DROP TABLE IF EXISTS `auth`.`customers`;

DROP TABLE IF EXISTS `auth`.`vendors`;

DROP TABLE IF EXISTS `auth`.`vendor_managers`;

DROP TABLE IF EXISTS `auth`.`system_announcements`;

DROP TABLE IF EXISTS `auth`.`block_records`;

DROP TABLE IF EXISTS `auth`.`admins`;

DROP TABLE IF EXISTS `auth`.`users`;

-- auth tables
CREATE TABLE `auth`.`users` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `name` text,
    `email` varchar(255) UNIQUE NOT NULL,
    `password` varchar(255) NOT NULL,
    `phone_number` varchar(25) UNIQUE NOT NULL,
    `role` varchar(20) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT(now())
);

CREATE TABLE `auth`.`admins` (
    `user_id` int PRIMARY KEY,
    FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`)
);

CREATE TABLE `auth`.`vendor_managers` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `name` text,
    `email` varchar(255) UNIQUE NOT NULL,
    `phone_number` varchar(25) UNIQUE NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT(now())
);

CREATE TABLE `auth`.`vendors` (
    `user_id` int PRIMARY KEY,
    `vendor_manager_id` int NOT NULL,
    `is_active` boolean NOT NULL DEFAULT true,
    `revenue` int NOT NULL DEFAULT 0 COMMENT '營業額',
    `address` varchar(255) UNIQUE NOT NULL,
    `description` text DEFAULT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`),
    FOREIGN KEY (`vendor_manager_id`) REFERENCES `auth`.`vendor_managers` (`id`)
);

CREATE TABLE `auth`.`customers` (
    `user_id` int PRIMARY KEY,
    `membership_level` int NOT NULL DEFAULT 0,
    `is_active` boolean NOT NULL DEFAULT true,
    `stored_balance` int NOT NULL DEFAULT 0,
    `address` varchar(255) NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`)
);

CREATE TABLE `auth`.`block_records` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `admin_id` int NOT NULL,
    `user_id` int NOT NULL,
    `reason` text NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT(now()),
    FOREIGN KEY (`admin_id`) REFERENCES `auth`.`admins` (`user_id`),
    FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`)
);

CREATE TABLE `auth`.`system_announcements` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `admin_id` int NOT NULL,
    `message` text NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT(now()),
    FOREIGN KEY (`admin_id`) REFERENCES `auth`.`admins` (`user_id`)
);

-- store tables
DROP TABLE IF EXISTS `store`.`products`;
CREATE TABLE `store`.`products` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `vendor_id` int NOT NULL,
    `name` varchar(50) NOT NULL,
    `price` int NOT NULL,
    `description` text,
    `image_url` varchar(255),
    `is_listed` boolean NOT NULL DEFAULT true COMMENT '上架狀態',
    `created_at` timestamp NOT NULL DEFAULT(now()),
    FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`)
);

DROP TABLE IF EXISTS `store`.`sugar_options`;
CREATE TABLE `store`.`sugar_options` (
    `product_id` int PRIMARY KEY,
    `options` text NOT NULL COMMENT '糖度選項，使用逗號分隔 eg. 70%, 50%, sgrfree',
    FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `store`.`ice_options`;
CREATE TABLE `store`.`ice_options` (
    `product_id` int PRIMARY KEY,
    `options` text NOT NULL COMMENT '冰量選項，使用逗號分隔 eg. 70%, 50%, 0%',
    FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`) ON DELETE CASCADE
);

DROP TABLE IF EXISTS `store`.`sizes_options`;
CREATE TABLE `store`.`sizes_options` (
    `product_id` int PRIMARY KEY,
    `options` text NOT NULL COMMENT '大小選項，使用逗號分隔 eg. L, M, S',
    FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`) ON DELETE CASCADE
);

CREATE TABLE `store`.`reviews` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `customer_id` int NOT NULL,
    `vendor_id` int NOT NULL,
    `rating` int NOT NULL,
    `review_content` text,
    `created_at` timestamp NOT NULL DEFAULT(now()),
    FOREIGN KEY (`customer_id`) REFERENCES `auth`.`customers` (`user_id`),
    FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`),
    UNIQUE KEY `customer_vendor_unique_idx` (`customer_id`, `vendor_id`)
);

DROP TABLE IF EXISTS `order`.`cart_items`;

DROP TABLE IF EXISTS `order`.`carts`;

DROP TABLE IF EXISTS `order`.`order_items`;

DROP TABLE IF EXISTS `order`.`orders`;

DROP TABLE IF EXISTS `order`.`discount_policies`;

-- order tables
CREATE TABLE `order`.`discount_policies` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `vendor_id` int NOT NULL,
    `is_available` boolean NOT NULL,
    `type` ENUM('percent', 'fixed') NOT NULL,
    `code` VARCHAR(10) DEFAULT NULL,
    `value` float NOT NULL,
    `min_purchase` int DEFAULT 0,
    `max_discount` int,
    `membership_limit` int NOT NULL DEFAULT 0,
    `start_date` date NOT NULL DEFAULT (CURRENT_DATE()) COMMENT '折價開始生效時間',
    `expiry_date` date COMMENT '折價結束時間',
    `created_at` timestamp NOT NULL DEFAULT(now()),
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '資料最後更新時間',
    FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`)
);

CREATE TABLE `order`.`orders` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `user_id` int NOT NULL,
    `vendor_id` int NOT NULL,
    `policy_id` int,
    `total_price` int NOT NULL,
    `discount_amount` int NOT NULL DEFAULT 0,
    `note` text COMMENT '備註',
    `payment_methods` ENUM('cash', 'button') NOT NULL COMMENT '付款方式',
    `refund_status` ENUM('pending', 'refunded', 'rejected') COMMENT '未退款為 NULL, pending=申請中',
    `refund_at` timestamp COMMENT '未退款為 NULL',
    `is_completed` boolean NOT NULL DEFAULT false,
    `is_delivered` boolean NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT(now()),
    `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '資料最後更新時間',
    FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`),
    FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`),
    FOREIGN KEY (`policy_id`) REFERENCES `order`.`discount_policies` (`id`)
);

CREATE TABLE `order`.`order_items` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `order_id` int NOT NULL,
    `product_id` int NOT NULL,
    `quantity` int NOT NULL,
    `price` int NOT NULL,
    `selected_sugar` varchar(50) NOT NULL COMMENT '使用者選的甜度, e.g., 50%',
    `selected_ice` varchar(50) NOT NULL COMMENT '使用者選的冰塊, e.g., 0%',
    `selected_size` varchar(20) NOT NULL COMMENT '使用者選的大小, e.g., L',
    KEY `idx_order` (`order_id`),
    FOREIGN KEY (`order_id`) REFERENCES `order`.`orders` (`id`),
    FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`)
);

CREATE TABLE `order`.`carts` (
    `customer_id` int PRIMARY KEY,
    `vendor_id` int NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT(now()),
    FOREIGN KEY (`customer_id`) REFERENCES `auth`.`customers` (`user_id`),
    FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`)
);

CREATE TABLE `order`.`cart_items` (
    `id` int PRIMARY KEY AUTO_INCREMENT,
    `cart_id` int NOT NULL,
    `product_id` int NOT NULL,
    `quantity` int NOT NULL DEFAULT 1,
    `selected_sugar` varchar(50) NOT NULL COMMENT '使用者選的甜度, e.g., 50%',
    `selected_ice` varchar(50) NOT NULL COMMENT '使用者選的冰塊, e.g., 0%',
    `selected_size` varchar(20) NOT NULL COMMENT '使用者選的大小, e.g., L',
    KEY `idx_cart` (`cart_id`),
    FOREIGN KEY (`cart_id`) REFERENCES `order`.`carts` (`customer_id`),
    FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`)
);
