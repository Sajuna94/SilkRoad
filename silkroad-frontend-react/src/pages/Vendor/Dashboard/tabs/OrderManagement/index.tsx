import { useState } from "react";
import { useCurrentUser } from "@/hooks/auth/user";
import { useVendorOrders, useUpdateOrder } from "@/hooks/order/order";
import type { VendorOrderSummary } from "@/types/order";
import styles from "./OrderManagement.module.scss";

export default function OrderTab() {
  const { data: currentUser } = useCurrentUser();
  const vendorId =
    currentUser?.role === "vendor" && "id" in currentUser
      ? currentUser.id
      : undefined;

  const { data: orders, isLoading, isError } = useVendorOrders(vendorId);
  const updateOrder = useUpdateOrder();

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

  if (isLoading) {
    return <div className={styles.container}>載入中...</div>;
  }

  if (isError || !orders) {
    return <div className={styles.container}>無法載入訂單資料</div>;
  }

  const handleToggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const handleUpdateStatus = (
    orderId: number,
    field: "is_completed" | "is_delivered",
    value: boolean
  ) => {
    updateOrder.mutate({
      order_id: orderId,
      [field]: value,
    });
  };

  return (
    <div className={styles.container}>
      <h1>訂單管理</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>暫無訂單</div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.order_id} className={styles.orderCard}>
              {/* 訂單摘要 */}
              <div
                className={styles.orderHeader}
                onClick={() => handleToggleExpand(order.order_id)}
              >
                <div className={styles.orderInfo}>
                  <span className={styles.orderId}>訂單 #{order.order_id}</span>
                  <span className={styles.orderDate}>{order.created_at}</span>
                </div>
                <div className={styles.orderMeta}>
                  <span className={styles.price}>${order.total_price}</span>
                  <span
                    className={`${styles.status} ${
                      order.is_completed ? styles.completed : styles.pending
                    }`}
                  >
                    {order.is_completed ? "已完成" : "處理中"}
                  </span>
                </div>
              </div>

              {/* 訂單詳情（展開時顯示） */}
              {expandedOrderId === order.order_id && (
                <div className={styles.orderDetails}>
                  {/* 訂單資訊 */}
                  <div className={styles.section}>
                    <h3>訂單資訊</h3>
                    <div className={styles.infoGrid}>
                      <div>
                        配送方式：{order.is_delivered ? "外送" : "自取"}
                      </div>
                      <div>
                        支付方式：
                        {order.payment_methods === "cash" ? "現金" : "儲值餘額"}
                      </div>
                      {order.note && <div>備註：{order.note}</div>}
                      {order.refund_status && (
                        <div>
                          退款狀態：
                          {order.refund_status === "refunded"
                            ? "已退款"
                            : "退款被拒"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 商品列表 */}
                  <div className={styles.section}>
                    <h3>商品明細</h3>
                    <div className={styles.itemList}>
                      {order.items.map((item) => (
                        <div key={item.order_item_id} className={styles.item}>
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className={styles.itemImage}
                          />
                          <div className={styles.itemInfo}>
                            <h4>{item.product_name}</h4>
                            <div className={styles.itemOptions}>
                              <span>{item.selected_size}</span>
                              <span>|</span>
                              <span>{item.selected_ice}</span>
                              <span>|</span>
                              <span>{item.selected_sugar}</span>
                            </div>
                          </div>
                          <div className={styles.itemPrice}>
                            <div>單價：${item.price}</div>
                            <div>數量：{item.quantity}</div>
                            <div className={styles.subtotal}>
                              小計：${item.subtotal}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 訂單操作 */}
                  <div className={styles.section}>
                    <h3>訂單操作</h3>
                    <div className={styles.actions}>
                      {/* 自取訂單：商家可以標記完成 */}
                      {!order.is_delivered ? (
                        order.is_completed ? (
                          <button
                            className={`${styles.statusButton} ${styles.completed}`}
                            disabled
                          >
                            ✓ 訂單已完成
                          </button>
                        ) : (
                          <button
                            className={`${styles.statusButton} ${styles.pending}`}
                            onClick={() =>
                              handleUpdateStatus(
                                order.order_id,
                                "is_completed",
                                true
                              )
                            }
                            disabled={updateOrder.isPending}
                          >
                            {updateOrder.isPending ? "處理中..." : "標記為完成"}
                          </button>
                        )
                      ) : (
                        /* 外送訂單：顯示狀態但不可操作 */
                        <button
                          className={`${styles.statusButton} ${
                            order.is_completed
                              ? styles.completed
                              : styles.waiting
                          }`}
                          disabled
                        >
                          {order.is_completed
                            ? "✓ 顧客已確認送達"
                            : "⏳ 等待顧客確認送達"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
