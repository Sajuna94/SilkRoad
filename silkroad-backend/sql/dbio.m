// Auth System
Table auth.users as U {
  id int [pk, increment]
  name text
  email varchar(255) [not null, unique]
  password varchar(255) [not null]
  phone_number varchar(25) [not null, unique]
  created_at timestamp [not null, default: `now()`]
}

Table auth.admins {
  user_id int [pk, ref: > U.id]
}

Table auth.block_records {
  id int [pk, increment]
  admin_id int [not null, ref: > auth.admins.user_id]
  user_id int [not null, ref: > U.id]
  reason text [not null]
  created_at timestamp [not null, default: `now()`]
}

Table auth.system_announcements {
  id int [pk, increment]
  admin_id int [not null, ref: > auth.admins.user_id]
  message text [not null]
  created_at timestamp [not null, default: `now()`]
}

Table auth.vendors {
  user_id int [pk, ref: > U.id]
  vendor_manager_id int [not null, ref: > auth.vendor_managers.id]
  is_active boolean [not null, default: true]
  revenue int [not null, default: 0, note: '營業額']
  address varchar(255) [not null, unique]
  created_at timestamp [not null, default: `now()`]
}

Table auth.vendor_managers {
  id int [pk, increment]
  name text
  email varchar(255) [not null, unique]
  phone_number varchar(25) [not null, unique]
  created_at timestamp [not null, default: `now()`]
}

Table auth.customers {
  user_id int [pk, ref: > U.id]
  membership_level int [not null, default: 0]
  is_active boolean [not null, default: true]
  stored_balance int [not null, default: 0]
  address varchar(255) [not null]
  created_at timestamp [not null, default: `now()`]
}

// Store System
Table store.products {
  id int [pk, increment]
  vendor_id int [not null, ref: > auth.vendors.user_id]
  name varchar(50) [not null]
  price int [not null]
  description text
  image_url text [unique]
  is_listed boolean [not null, default: true, note: '上架狀態']
  created_at timestamp [not null, default: `now()`]
}

Table store.reviews {
  id int [pk, increment]
  customer_id int [not null, ref: > auth.customers.user_id]
  vendor_id int [not null, ref: > auth.vendors.user_id]
  rating int [not null]
  review_content text
  created_at timestamp [not null, default: `now()`]

  indexes {
    (customer_id, vendor_id) [unique, name: "customer_vendor_unique_idx"]
  }
}

// Order System
Enum order.discount_type {
  percent
  fixed
}

Table order.discount_policies {
  id int [pk, increment]
  vendor_id int [not null, ref: > auth.vendors.user_id]
  type order.discount_type [not null]
  value int [not null]
  min_purchase int [default: 0]
  max_discount int
  membership_limit int [not null, default: 0]
  expiry_date date [note: '折價結束時間']
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`, note: 'TODO: Add ON UPDATE ON UPDATE CURRENT_TIMESTAMP']
}

Enum order.payment_methods {
  cash      // 現金
  credit    // 刷卡
}

Enum order.refund_status {
  refunded     // 已退款
  rejected     // 退款被拒
}

Table order.orders {
  id int [pk, increment]
  user_id int [not null, ref: > U.id]
  vendor_id int [not null, ref: > auth.vendors.user_id]
  policy_id int [ref: > order.discount_policies.id]
  total_price int [not null]
  note text [note: '備註']
  payment_methods order.payment_methods [not null, note: '付款方式']
  refund_status order.refund_status [note: '未退款為 NULL']
  refund_at timestamp [note: '未退款為 NULL']
  is_completed boolean [not null, default: false]
  is_delivered boolean [not null]
  created_at timestamp [not null, default: `now()`]
  updated_at timestamp [not null, default: `now()`, note: 'TODO: Add ON UPDATE ON UPDATE CURRENT_TIMESTAMP']
}

Table order.order_items {
  order_id int [not null, ref: > order.orders.id]
  product_id int [not null, ref: > store.products.id]
  quantity int [not null]

  Indexes {
    (order_id, product_id) [pk]
  }
}

Table order.carts {
  customer_id int [pk, ref: > auth.customers.user_id]
  vendor_id int [not null, ref: > auth.vendors.user_id]
  created_at timestamp [not null, default: `now()`]
}

Table order.cart_items {
  cart_id int [not null, ref: > order.carts.customer_id]
  product_id int [not null, ref: > store.products.id]
  quantity int [not null, default: 1]

  Indexes {
    (cart_id, product_id) [pk]
  }
}
