import { useState } from "react";
import { useCurrentUser } from "@/hooks/auth/user";
import { useVendorOrders, useUpdateOrder } from "@/hooks/order/order";
import styles from "./OrderManagement.module.scss";
import type { VendorOrderSummary } from "@/types/order";
import RefundModal from "../RefundModal/RefundModal";

export default function OrderTab() {
  const { data: currentUser } = useCurrentUser();
  const vendorId =
    currentUser?.role === "vendor" && "id" in currentUser
      ? currentUser.id
      : undefined;

  const { data: orders, isLoading, isError } = useVendorOrders(vendorId);
  const updateOrder = useUpdateOrder();

  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [refundModalOrder, setRefundModalOrder] = useState<any | null>(null);

  if (isLoading) {
    return <div className={styles.container} style={{ color: "black" }}>載入中...</div>;
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

  const renderOrderStatus = (order: VendorOrderSummary) => {
    if (order.refund_status === "refunded") {
      return (
        <span className={`${styles.status} ${styles.refunded}`}>已退款</span>
      );
    }
    if (order.is_completed) {
      return (
        <span className={`${styles.status} ${styles.completed}`}>已完成</span>
      );
    }
    if (order.refund_status === "pending") {
      return (
        <span className={`${styles.status} ${styles.waiting}`}>退款申請中</span>
      );
    }
    return <span className={`${styles.status} ${styles.pending}`}>處理中</span>;
  };

  const handleRefundAction = (
    orderId: number,
    status: "refunded" | "rejected"
  ) => {
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

    updateOrder.mutate(
      {
        order_id: orderId,
        refund_status: status,
        refund_at: status === "refunded" ? timestamp : undefined,
      },
      {
        onSuccess: () => {
          setRefundModalOrder(null);
          alert(status === "refunded" ? "已同意退款" : "已拒絕退款");
        },
        onError: (err) => alert("操作失敗: " + err.message),
      }
    );
  };

  return (
    <div className={styles.container}>
      <h1>訂單管理</h1>

      {orders.length === 0 ? (
        <div className={styles.empty}>暫無訂單</div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order: any) => (
            <div key={order.order_id} className={styles.orderCard}>
              <div
                className={`${styles.orderHeader} ${
                  expandedOrderId === order.order_id ? styles.active : ""
                }`}
                onClick={() => handleToggleExpand(order.order_id)}
              >
                <div className={styles.headerLeft}>
                  <span className={styles.orderId}>#{order.order_id}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div className={styles.headerRight}>
                  <span className={styles.deliveryTag}>
                    {order.is_delivered ? "外送" : "自取"}
                  </span>

                  <span className={styles.price}>${order.total_price}</span>

                  {/* 狀態顯示 (包含已退款邏輯) */}
                  {renderOrderStatus(order)}
                  <span
                    className={`${styles.arrow} ${
                      expandedOrderId === order.order_id ? styles.up : ""
                    }`}
                  ></span>
                </div>
              </div>

              {/* 訂單詳情（展開時顯示） */}
              {expandedOrderId === order.order_id && (
                <div className={styles.orderDetails}>
                  <div className={styles.infoSection}>
                    <div className={styles.infoItem}>
                      <span className={styles.label}>支付方式</span>
                      <span className={styles.value}>
                        {order.payment_methods === "cash" ? "現金" : "餘額"}
                      </span>
                    </div>
                    {order.note && (
                      <div
                        className={styles.infoItem}
                        style={{ gridColumn: "1 / -1" }}
                      >
                        <span className={styles.label}>備註</span>
                        <span className={styles.value}>{order.note}</span>
                      </div>
                    )}
                  </div>

                  <hr className={styles.divider} />

                  <div className={styles.itemSection}>
                    <h4 className={styles.sectionTitle}>
                      商品明細 ({order.items.length})
                    </h4>
                    <div className={styles.scrollableList}>
                      {order.items.map((item: any) => (
                        <div
                          key={item.order_item_id}
                          className={styles.itemRow}
                        >
                          <img
                            src={item.product_image}
                            alt={item.product_name}
                            className={styles.itemThumb}
                          />
                          <div className={styles.itemContent}>
                            <div className={styles.itemName}>
                              {item.product_name}
                            </div>
                            <div className={styles.itemSpecs}>
                              {item.selected_size} / {item.selected_ice} /{" "}
                              {item.selected_sugar}
                            </div>
                          </div>
                          <div className={styles.itemMeta}>
                            <span className={styles.qty}>x{item.quantity}</span>
                            <span className={styles.subtotal}>
                              ${item.subtotal}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 下方：(如果已退款則不顯示操作) */}
                  {order.refund_status !== "refunded" && (
                    <div className={styles.actionSection}>
                      {order.refund_status === "pending" ? (
                        <div className={styles.refundAlert}>
                          <span>⚠️ 此訂單有退款申請，請先處理</span>
                          <button
                            className={`${styles.actionBtn} ${styles.btnRefund}`}
                            onClick={() => setRefundModalOrder(order)}
                          >
                            處理退款
                          </button>
                        </div>
                      ) : order.refund_status === "refunded" ? (
                        // 已退款狀態，不顯示任何操作按鈕
                        <div className={styles.deliveryStatus}>
                          <span className={styles.textDanger}>
                            訂單已退款結案
                          </span>
                        </div>
                      ) : (
                        // 正常流程 (無退款 or 退款被拒絕後恢復正常流程)
                        <>
                          {!order.is_delivered ? (
                            order.is_completed ? (
                              <button
                                className={`${styles.actionBtn} ${styles.btnDisabled}`}
                                disabled
                              >
                                訂單已完成
                              </button>
                            ) : (
                              <button
                                className={`${styles.actionBtn} ${styles.btnPrimary}`}
                                onClick={() =>
                                  handleUpdateStatus(
                                    order.order_id,
                                    "is_completed",
                                    true
                                  )
                                }
                                disabled={updateOrder.isPending}
                              >
                                {updateOrder.isPending
                                  ? "處理中..."
                                  : "標記為完成 (自取)"}
                              </button>
                            )
                          ) : (
                            // 外送訂單邏輯
                            <div className={styles.deliveryStatus}>
                              {order.is_completed ? (
                                <span className={styles.textSuccess}>
                                  顧客已確認送達
                                </span>
                              ) : (
                                <span className={styles.textWarning}>
                                  等待顧客確認送達
                                </span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <RefundModal
        isOpen={!!refundModalOrder}
        onClose={() => setRefundModalOrder(null)}
        order={refundModalOrder}
        onRefund={handleRefundAction}
        isProcessing={updateOrder.isPending}
      />
    </div>
  );
}
