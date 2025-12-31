import { useState } from "react";
import { useCurrentUser } from "@/hooks/auth/user";
import { useVendorOrders, useUpdateOrder } from "@/hooks/order/order";
import styles from "./RefundManagement.module.scss";

export default function RefundManagement() {
    const { data: currentUser } = useCurrentUser();
    const vendorId = currentUser?.role === "vendor" && "id" in currentUser ? currentUser.id : undefined;

    const { data: orders, isLoading, isError } = useVendorOrders(vendorId);
    const updateOrder = useUpdateOrder();

    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);

    // 只顯示有退款申請的訂單 (refund_status = 'pending')
    const refundOrders = orders?.filter(order => order.refund_status === 'pending') || [];

    if (isLoading) {
        return <div className={styles.container}>載入中...</div>;
    }

    if (isError) {
        return <div className={styles.container}>無法載入退款申請</div>;
    }

    const handleToggleExpand = (orderId: number) => {
        setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
    };

    const handleRefund = (orderId: number, status: "refunded" | "rejected") => {
        const now = new Date();
        const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

        updateOrder.mutate({
            order_id: orderId,
            refund_status: status,
            refund_at: status === "refunded" ? timestamp : undefined,
        });
    };

    return (
        <div className={styles.container}>
            <h1>退款申請管理</h1>

            {refundOrders.length === 0 ? (
                <div className={styles.empty}>目前沒有待處理的退款申請</div>
            ) : (
                <div className={styles.orderList}>
                    {refundOrders.map((order) => (
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
                                    <span className={`${styles.status} ${styles.pending}`}>
                                        待處理
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
                                            <div>配送方式：{order.is_delivered ? "外送" : "自取"}</div>
                                            <div>
                                                支付方式：
                                                {order.payment_methods === "cash" ? "現金" : "儲值餘額"}
                                            </div>
                                            {order.note && <div>備註：{order.note}</div>}
                                            <div>
                                                訂單狀態：
                                                {order.is_completed ? "已完成" : "處理中"}
                                            </div>
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
                                                        <div>數量：{item.quantity}</div>
                                                        <div className={styles.subtotal}>
                                                            ${item.subtotal}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 退款操作 */}
                                    <div className={styles.section}>
                                        <h3>退款處理</h3>
                                        <div className={styles.refundActions}>
                                            <button
                                                className={styles.approveBtn}
                                                onClick={() => handleRefund(order.order_id, "refunded")}
                                                disabled={updateOrder.isPending}
                                            >
                                                {updateOrder.isPending ? '處理中...' : '同意退款'}
                                            </button>
                                            <button
                                                className={styles.rejectBtn}
                                                onClick={() => handleRefund(order.order_id, "rejected")}
                                                disabled={updateOrder.isPending}
                                            >
                                                {updateOrder.isPending ? '處理中...' : '拒絕退款'}
                                            </button>
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
