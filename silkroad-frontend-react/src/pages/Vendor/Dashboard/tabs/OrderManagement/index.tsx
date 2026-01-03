import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { useCurrentUser } from "@/hooks/auth/user";
import { useVendorOrders, useUpdateOrder } from "@/hooks/order/order";
import styles from "./OrderManagement.module.scss";
import type { VendorOrderSummary } from "@/types/order";
import RefundModal from "../RefundModal/RefundModal";

type StatusFilter = "ALL" | "COMPLETED" | "PENDING" | "REFUND" | "DELIVERING";
type DeliveryFilter = "ALL" | "DELIVERY" | "PICKUP";

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

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [deliveryFilter, setDeliveryFilter] = useState<DeliveryFilter>("ALL");
  const [inputSearchId, setInputSearchId] = useState("");
  const [activeSearchId, setActiveSearchId] = useState("");

  const [showScrollBtn, setShowScrollBtn] = useState(false);
  // track completed items per order locally
  const [completedItems, setCompletedItems] = useState<Record<number, Set<number>>>({});

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const orderIdParam = params.get("orderId");
    if (orderIdParam) {
      const id = parseInt(orderIdParam, 10);
      if (!isNaN(id)) {
        setExpandedOrderId(id);
        setTimeout(() => {
          const el = document.getElementById(`order-${id}`);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
  }, [location.search]);

  // initialize completedItems when orders load
  useEffect(() => {
    if (!orders) return;
    const init: Record<number, Set<number>> = {};
    orders.forEach((o: any) => {
      init[o.order_id] = new Set<number>();
    });
    setCompletedItems(init);
  }, [orders]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollBtn(true);
      } else {
        setShowScrollBtn(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleSearch = () => {
    setActiveSearchId(inputSearchId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const filteredOrders = useMemo(() => {
    if (!orders) return [];

    return orders.filter((order) => {
      if (activeSearchId) {
        const idStr = String(order.order_id);
        if (!idStr.includes(activeSearchId)) {
          return false;
        }
      }

      // 配送方式篩選
      if (deliveryFilter === "DELIVERY" && !order.is_delivered) return false;
      if (deliveryFilter === "PICKUP" && order.is_delivered) return false;

      // 訂單狀態篩選（更新邏輯：處理中->派送中/已完成 取決於配送方式）
      if (statusFilter !== "ALL") {
        const isRefund =
          order.refund_status === "refunded" ||
          order.refund_status === "pending"; // 退款相關歸在同一類

        if (statusFilter === "REFUND") {
          if (!isRefund) return false;
        }

        if (statusFilter === "PENDING") {
          // 處理中：尚未完成處理且非退款
          if (isRefund || order.is_completed) return false;
        }

        if (statusFilter === "DELIVERING") {
          // 派送中：外送訂單且處理已完成（vendor 已標記完成），且非退款
          if (isRefund || !order.is_delivered || !order.is_completed) return false;
        }

        if (statusFilter === "COMPLETED") {
          // 已完成（針對自取）：非外送且處理已完成，且非退款
          if (isRefund || order.is_delivered || !order.is_completed) return false;
        }
      }

      return true;
    });
  }, [orders, statusFilter, deliveryFilter, activeSearchId]);

  if (isLoading) {
    return (
      <div className={styles.container} style={{ color: "black" }}>
        載入中...
      </div>
    );
  }

  if (isError || !orders) {
    return (
      <div className={styles.container} style={{ color: "black" }}>
        無法載入訂單資料
      </div>
    );
  }

  const handleToggleExpand = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const toggleItemCompleted = (orderId: number, itemId: number, checked: boolean) => {
    setCompletedItems((prev) => {
      const copy: Record<number, Set<number>> = { ...prev };
      const set = new Set(copy[orderId] ? Array.from(copy[orderId]) : []);
      if (checked) set.add(itemId); else set.delete(itemId);
      copy[orderId] = set;

      // if all items are checked, mark order completed via API
      const order = orders?.find((o: any) => o.order_id === orderId);
      if (order && set.size === order.items.length && !order.is_completed) {
        updateOrder.mutate({ order_id: orderId, is_completed: true });
      }

      return copy;
    });
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
        onError: (err: any) => alert("操作失敗: " + (err?.message || err)),
      }
    );
  };

  const renderOrderStatus = (order: VendorOrderSummary) => {
    // 退款優先顯示
    if (order.refund_status === "refunded") {
      return (
        <span className={`${styles.status} ${styles.refunded}`}>已退款</span>
      );
    }
    if (order.refund_status === "pending") {
      return (
        <span className={`${styles.status} ${styles.waiting}`}>退款申請中</span>
      );
    }

    // 處理中 / 派送中 / 已完成 的流程：
    // - 當尚未由商家標記完成 (is_completed === false)：顯示「處理中」
    // - 當已標記完成 (is_completed === true)：如果是外送顯示「派送中」，否則顯示「已完成」
    if (!order.is_completed) {
      return <span className={`${styles.status} ${styles.pending}`}>處理中</span>;
    }

    if (order.is_delivered) {
      return <span className={`${styles.status} ${styles.delivering}`}>派送中</span>;
    }

    return <span className={`${styles.status} ${styles.completed}`}>已完成</span>;
  };

  return (
    <div className={styles.container}>
      <h1>訂單管理</h1>

      <div className={styles.filters}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="輸入訂單編號..."
            value={inputSearchId}
            onChange={(e) => setInputSearchId(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
          />
          <button className={styles.searchBtn} onClick={handleSearch}>
            搜尋
          </button>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className={styles.filterSelect}
        >
          <option value="ALL">全部狀態</option>
          <option value="PENDING">處理中</option>
          <option value="DELIVERING">派送中</option>
          <option value="COMPLETED">已完成</option>
          <option value="REFUND">退款相關</option>
        </select>

        <select
          value={deliveryFilter}
          onChange={(e) => setDeliveryFilter(e.target.value as DeliveryFilter)}
          className={styles.filterSelect}
        >
          <option value="ALL">全部配送方式</option>
          <option value="DELIVERY">外送</option>
          <option value="PICKUP">自取</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className={styles.empty}>
          {orders.length > 0 ? "沒有符合篩選條件的訂單" : "暫無訂單"}
        </div>
      ) : (
        <div className={styles.orderList}>
          {filteredOrders.map((order: any) => (
            <div
              id={`order-${order.order_id}`}
              key={order.order_id}
              className={styles.orderCard}
            >
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

                  <span className={styles.headerTotalPrice}>{'$' + order.total_price}</span>
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
                    {order.is_delivered && (
                      <div className={styles.infoItem}>
                        <span className={styles.label}>地址</span>
                        <span className={styles.value}>
                          {((order as any).address_info && (order as any).address_info !== null && (order as any).address_info !== "")
                            ? (order as any).address_info
                            : (
                                (order as any).address ||
                                (order as any).delivery_address ||
                                (order as any).user_address ||
                                "未提供地址"
                              )}
                        </span>
                      </div>
                    )}
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
                        <div key={item.order_item_id} className={styles.itemRow}>
                          <div className={styles.checkContainer}>
                            <input
                              type="checkbox"
                              className={styles.thumbCheckbox}
                              checked={
                                order.is_completed ||
                                !!(completedItems[order.order_id] && completedItems[order.order_id].has(item.order_item_id))
                              }
                              disabled={order.is_completed}
                              onChange={(e) =>
                                toggleItemCompleted(order.order_id, item.order_item_id, e.target.checked)
                              }
                            />
                          </div>
                          <div className={styles.itemThumbWrap}>
                            <img
                              src={item.product_image}
                              alt={item.product_name}
                              className={styles.itemThumb}
                            />
                          </div>
                          <div className={styles.itemContent}>
                            <div className={styles.itemName}>{item.product_name}</div>
                            <div className={styles.itemSpecs}>
                              {item.selected_size} / {item.selected_ice} / {item.selected_sugar}
                            </div>
                          </div>
                          <div className={styles.itemMeta}>
														<span className={styles.subtotal}>{'$' + item.subtotal}</span>
                            <span className={styles.qty}>x{item.quantity}</span>
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
                          <div className={styles.totalPriceAboveActions}>
                            <span className={styles.totalPriceLabel}>總價：</span>
                            <span className={styles.totalPriceValue}>{'$$' + order.total_price}</span>
                          </div>
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
                                  : "標記為完成"}
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
      {typeof document !== "undefined" &&
        createPortal(
          <button
            className={`${styles.scrollTopBtn} ${showScrollBtn ? styles.show : ""}`}
            onClick={scrollToTop}
            title="回到頂部"
          >
            ↑
          </button>,
          document.body
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
