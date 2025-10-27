CREATE SCHEMA `order`;

CREATE SCHEMA `auth`;

CREATE SCHEMA `store`;

CREATE TABLE `order`.`discount_policies` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `type` ENUM ('percent', 'fixed') NOT NULL,
  `value` int NOT NULL,
  `min_purchase` int DEFAULT 0,
  `max_discount` int,
  `membership_limit` int NOT NULL DEFAULT 0,
  `expiry_date` date COMMENT '折價結束時間',
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) COMMENT 'TODO: Add ON UPDATE ON UPDATE CURRENT_TIMESTAMP'
);

CREATE TABLE `order`.`orders` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `policy_id` int,
  `total_price` int NOT NULL,
  `note` text COMMENT '備註',
  `payment_methods` ENUM ('cash', 'credit') NOT NULL COMMENT '付款方式',
  `refund_status` ENUM ('refunded', 'rejected') COMMENT '未退款為 NULL',
  `refund_at` timestamp COMMENT '未退款為 NULL',
  `is_completed` boolean NOT NULL DEFAULT false,
  `is_delivered` boolean NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now()),
  `updated_at` timestamp NOT NULL DEFAULT (now()) COMMENT 'TODO: Add ON UPDATE ON UPDATE CURRENT_TIMESTAMP'
);

CREATE TABLE `order`.`order_items` (
  `order_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`order_id`, `product_id`)
);

CREATE TABLE `order`.`carts` (
  `customer_id` int PRIMARY KEY,
  `vendor_id` int NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `order`.`cart_items` (
  `cart_id` int NOT NULL,
  `product_id` int NOT NULL,
  `quantity` int NOT NULL DEFAULT 1,
  PRIMARY KEY (`cart_id`, `product_id`)
);

CREATE TABLE `auth`.`users` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` text,
  `email` varchar(255) UNIQUE NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone_number` varchar(25) UNIQUE NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `auth`.`admins` (
  `user_id` int PRIMARY KEY
);

CREATE TABLE `auth`.`block_records` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `user_id` int NOT NULL,
  `reason` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `auth`.`system_announcements` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `admin_id` int NOT NULL,
  `message` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `auth`.`vendors` (
  `user_id` int PRIMARY KEY,
  `vendor_manager_id` int NOT NULL,
  `is_active` boolean NOT NULL DEFAULT true,
  `revenue` int NOT NULL DEFAULT 0 COMMENT '營業額',
  `address` varchar(255) UNIQUE NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `auth`.`vendor_managers` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `name` text,
  `email` varchar(255) UNIQUE NOT NULL,
  `phone_number` varchar(25) UNIQUE NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `auth`.`customers` (
  `user_id` int PRIMARY KEY,
  `membership_level` int NOT NULL DEFAULT 0,
  `is_active` boolean NOT NULL DEFAULT true,
  `stored_balance` int NOT NULL DEFAULT 0,
  `address` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `store`.`products` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `vendor_id` int NOT NULL,
  `name` varchar(50) NOT NULL,
  `price` int NOT NULL,
  `description` text,
  `image_url` text UNIQUE,
  `is_listed` boolean NOT NULL DEFAULT true COMMENT '上架狀態',
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE TABLE `store`.`reviews` (
  `id` int PRIMARY KEY AUTO_INCREMENT,
  `customer_id` int NOT NULL,
  `vendor_id` int NOT NULL,
  `rating` int NOT NULL,
  `review_content` text,
  `created_at` timestamp NOT NULL DEFAULT (now())
);

CREATE UNIQUE INDEX `customer_vendor_unique_idx` ON `store`.`reviews` (`customer_id`, `vendor_id`);

ALTER TABLE `auth`.`admins` ADD FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`);

ALTER TABLE `auth`.`block_records` ADD FOREIGN KEY (`admin_id`) REFERENCES `auth`.`admins` (`user_id`);

ALTER TABLE `auth`.`block_records` ADD FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`);

ALTER TABLE `auth`.`system_announcements` ADD FOREIGN KEY (`admin_id`) REFERENCES `auth`.`admins` (`user_id`);

ALTER TABLE `auth`.`vendors` ADD FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`);

ALTER TABLE `auth`.`vendors` ADD FOREIGN KEY (`vendor_manager_id`) REFERENCES `auth`.`vendor_managers` (`id`);

ALTER TABLE `auth`.`customers` ADD FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`);

ALTER TABLE `store`.`products` ADD FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`);

ALTER TABLE `store`.`reviews` ADD FOREIGN KEY (`customer_id`) REFERENCES `auth`.`customers` (`user_id`);

ALTER TABLE `store`.`reviews` ADD FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`);

ALTER TABLE `order`.`discount_policies` ADD FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`);

ALTER TABLE `order`.`orders` ADD FOREIGN KEY (`user_id`) REFERENCES `auth`.`users` (`id`);

ALTER TABLE `order`.`orders` ADD FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`);

ALTER TABLE `order`.`orders` ADD FOREIGN KEY (`policy_id`) REFERENCES `order`.`discount_policies` (`id`);

ALTER TABLE `order`.`order_items` ADD FOREIGN KEY (`order_id`) REFERENCES `order`.`orders` (`id`);

ALTER TABLE `order`.`order_items` ADD FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`);

ALTER TABLE `order`.`carts` ADD FOREIGN KEY (`customer_id`) REFERENCES `auth`.`customers` (`user_id`);

ALTER TABLE `order`.`carts` ADD FOREIGN KEY (`vendor_id`) REFERENCES `auth`.`vendors` (`user_id`);

ALTER TABLE `order`.`cart_items` ADD FOREIGN KEY (`cart_id`) REFERENCES `order`.`carts` (`customer_id`);

ALTER TABLE `order`.`cart_items` ADD FOREIGN KEY (`product_id`) REFERENCES `store`.`products` (`id`);