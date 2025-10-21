// Auth System
Table users {
  id int [pk, increment]
  email varchar(255) [not null, unique]
  password varchar(255) [not null]
  name varchar(100) [not null]
  phone_number varchar(20) [not null, unique]
  created_at timestamp [not null, default: `now()`]
}

Table admins [note: '管理者資料'] {
  user_id int [not null, ref: > users.id]
  operation_logs text [note: '管理紀錄']
  system_announcement text [note: '系統公告']
  ban_record text [note: '封鎖紀錄']
}

Table customers [note: '顧客資料'] {
  user_id int [not null, ref: > users.id]
  address varchar(255) [not null]
  membership_level int [not null, default: 0, note: '會員等級']
  registration_date timestamp [not null, default: `now()`, note: '註冊日期']
  membership_status boolean [not null, default: true, note: '會員狀態(啟用/停用)']
  stored_balance decimal(10,2) [not null, default: 0, note: '儲值金額']
}

Table vendors [note: '店家資料'] {
  user_id int [not null, ref: > users.id]
  address varchar(255) [not null, unique]
  access_status boolean [not null, default: true, note: '狀態(正常/停權)']
  revenue decimal(12,2) [not null, default: 0, note: '營業額']
  manager_email varchar(255) [not null, unique, ref: > vendor_managers.email, note: '負責人']
}

Table vendor_managers [note: '店家負責人資料'] {
  name varchar(100) [not null]
  email varchar(255) [not null, unique]
  phone_number varchar(20) [not null, unique]
}

// Store System
Table products {
  id int [pk, increment]
  vendor_id int [not null, ref: > vendors.user_id]
  name varchar(255) [not null]
  description text
  image_url text
  price decimal(10,2) [not null]
  listing boolean [not null, note: '狀態(上架/下架)']
}

Table shopping_carts {
  id int [pk, increment]
  customer_id int [not null, ref: > customers.user_id]
  vendor_id int [not null, ref: > vendors.user_id]
}

Table cart_items {
  cart_id int [not null, ref: > shopping_carts.id]
  product_id int [not null, ref: > products.id]
  product_quantity int [not null, default: 1, note: '產品數量 (>0)']
}

Table vendor_reviews [note: '店家評論和評分'] {
  id int [pk, increment]
  customer_id int [not null, ref: > customers.user_id]
  vendor_id int [not null, ref: > vendors.user_id]
  product_id int [not null, ref: > products.id]
  ratings int [not null, note: '顧客評分']
  review_content text [note: '評論內容']
  created_at timestamp [not null, default: `now()`, note: '發布日期']
}

Enum PaymentMethods {
  cash      // 現金
  credit    // 刷卡
}

Enum OrderStatus {
  pending      // 等待中
  processing   // 處理中
  shipping     // 配送中
  delivered    // 已送達
}

Enum RefundStatus {
  not_yet      // 尚未退款
  refunded     // 已退款
  rejected     // 退款被拒
}

Table orders [note: '訂單資料'] {
  id int [pk, increment]
  customer_id int [not null, ref: > customers.user_id]
  vendor_id int [not null, ref: > vendors.user_id]
  total_price decimal(10,2) [not null, note: '訂單總金額']
  payment_method PaymentMethods [not null, default: 'cash', note: "付款方式"]
  order_status OrderStatus [not null, default: 'pending', note: "訂單狀態"]
  delivery_information text [note: '配送資訊']
  platform_fee decimal(10,2) [not null, note: '平台費用']
  vendor_profit_share decimal(10,2) [not null, note: '店家利潤分成']
  refund_status RefundStatus [not null, default: 'not_yet', note: '退款狀態']
  refund_at timestamp [note: '退款時間']
  created_at timestamp [not null, default: `now()`, note: '創立時間']
}

Table order_items {
  order_id int [not null, ref: > orders.id]
  product_id int [not null, ref: > products.id]
  product_quantity int [not null, default: 1, note: '產品數量 (>0)']
}

Enum CouponType {
  percentage  // 百分比折扣
  fixed       // 固定金額
}

Table coupons [note: '紀錄折扣資料'] {
  code varchar(50) [pk, note: "優惠券代碼，唯一"]
  type CouponType [not null, note: "優惠券類型"]
  value decimal(10, 2) [not null, note: "折扣金額或百分比"]
  expiry_date date [not null, note: "到期日期"]
}
