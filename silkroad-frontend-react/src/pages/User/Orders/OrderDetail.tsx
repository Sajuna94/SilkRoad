import { useParams, useNavigate } from "react-router-dom";
import { useOrderDetails, useUpdateOrder } from "@/hooks/order/order";
import { useCurrentUser } from "@/hooks/auth/user";
import styles from "./OrderDetail.module.scss";

export default function OrderDetail() {
    const { orderId } = useParams<{ orderId: string }>();
    const navigate = useNavigate();

    const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
    const updateOrder = useUpdateOrder();

    // 需要傳入 orderId, userId, vendorId
    // 這裡我們先從購物車取得 vendorId（實際上應該從訂單列表點擊進來時傳入）
    // 暫時設為 undefined，等 API 回傳後再處理
    const orderIdNum = orderId ? parseInt(orderId, 10) : undefined;

    const {
        data: orderData,
        isLoading: isOrderLoading,
        isError,
    } = useOrderDetails(
        orderIdNum,
        currentUser?.id,
        undefined // vendorId 可以先設為 undefined，讓後端處理
    );

    const handleConfirmDelivery = () => {
        if (!orderIdNum) return;
        updateOrder.mutate({
            order_id: orderIdNum,
            is_completed: true,
        });
    };

    const handleRequestRefund = () => {
        if (!orderIdNum) return;
        updateOrder.mutate({
            order_id: orderIdNum,
            refund_status: "pending",
        });
    };

    if (isUserLoading || isOrderLoading) {
        return <div className={styles.container}>載入中...</div>;
    }

    if (isError || !orderData) {
        return (
            <div className={styles.container}>
                <h1>無法載入訂單資訊</h1>
                <button onClick={() => navigate("/orders")}>返回訂單列表</button>
            </div>
        );
    }

    const { order_info, data: items } = orderData;

    // 計算小計（折扣前金額）
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>訂單詳情</h1>
                <button className={styles.backBtn} onClick={() => navigate("/orders")}>
                    返回訂單列表
                </button>
            </div>

            {/* 訂單基本資訊 */}
            <div className={styles.section}>
                <h2>訂單資訊</h2>
                <div className={styles.infoGrid}>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>訂單編號：</span>
                        <span>{orderId}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>配送方式：</span>
                        <span>{order_info.is_delivered ? '外送' : '自取'}</span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>支付方式：</span>
                        <span>
                            {order_info.payment_methods === 'cash' ? '現金' : '儲值餘額'}
                        </span>
                    </div>
                    <div className={styles.infoItem}>
                        <span className={styles.label}>訂單狀態：</span>
                        <span className={order_info.is_completed ? styles.completed : styles.pending}>
                            {order_info.is_completed ? '已完成' : '處理中'}
                        </span>
                    </div>
                    {order_info.refund_status && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>退款狀態：</span>
                            <span className={styles.refund}>
                                {order_info.refund_status === 'pending'
                                    ? '審核中'
                                    : order_info.refund_status === 'refunded'
                                    ? '已退款'
                                    : '退款被拒'}
                            </span>
                        </div>
                    )}
                    {order_info.note && (
                        <div className={styles.infoItem}>
                            <span className={styles.label}>訂單備註：</span>
                            <span>{order_info.note}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 商品列表 */}
            <div className={styles.section}>
                <h2>商品明細</h2>
                <div className={styles.itemList}>
                    {items.map((item) => (
                        <div key={item.order_item_id} className={styles.item}>
                            <img
                                src={item.product_image}
                                alt={item.product_name}
                                className={styles.itemImage}
                            />
                            <div className={styles.itemInfo}>
                                <h3>{item.product_name}</h3>
                                <div className={styles.itemOptions}>
                                    <span>規格：{item.selected_size}</span>
                                    <span>冰塊：{item.selected_ice}</span>
                                    <span>糖度：{item.selected_sugar}</span>
                                </div>
                            </div>
                            <div className={styles.itemPrice}>
                                <div className={styles.unitPrice}>單價：${item.price}</div>
                                <div className={styles.quantity}>數量：{item.quantity}</div>
                                <div className={styles.subtotal}>小計：${item.subtotal}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* 訂單金額摘要 */}
            <div className={styles.section}>
                <h2>訂單摘要</h2>
                <div className={styles.summary}>
                    <div className={styles.summaryRow}>
                        <span>商品小計：</span>
                        <span>${subtotal}</span>
                    </div>
                    {order_info.discount_amount > 0 && (
                        <div className={`${styles.summaryRow} ${styles.discount}`}>
                            <span>折扣金額：</span>
                            <span>-${order_info.discount_amount}</span>
                        </div>
                    )}
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                        <span>訂單總計：</span>
                        <span>${order_info.total_price}</span>
                    </div>
                </div>
            </div>

            {/* 外送訂單的確認送達按鈕 */}
            {order_info.is_delivered && !order_info.is_completed && (
                <div className={styles.section}>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirmDelivery}
                        disabled={updateOrder.isPending}
                    >
                        {updateOrder.isPending ? '處理中...' : '確認已送達'}
                    </button>
                </div>
            )}

            {/* 退款申請按鈕 */}
            <div className={styles.section}>
                {order_info.refund_status === null ? (
                    <button
                        className={styles.refundButton}
                        onClick={handleRequestRefund}
                        disabled={updateOrder.isPending}
                    >
                        {updateOrder.isPending ? '處理中...' : '申請退款'}
                    </button>
                ) : (
                    <div className={styles.refundStatus}>
                        <span className={styles.label}>退款狀態：</span>
                        <span
                            className={`${styles.statusBadge} ${
                                order_info.refund_status === "pending"
                                    ? styles.pending
                                    : order_info.refund_status === "refunded"
                                    ? styles.approved
                                    : styles.rejected
                            }`}
                        >
                            {order_info.refund_status === "pending"
                                ? "審核中"
                                : order_info.refund_status === "refunded"
                                ? "已退款"
                                : "退款被拒"}
                        </span>
                        {order_info.refund_at && (
                            <span className={styles.refundDate}>
                                退款時間：{order_info.refund_at}
                            </span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
