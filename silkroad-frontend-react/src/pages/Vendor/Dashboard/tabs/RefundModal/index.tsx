import { createPortal } from "react-dom";
import styles from "./RefundModal.module.scss";
import type { VendorOrderSummary } from "@/types/order";

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: VendorOrderSummary | null;
  onRefund: (orderId: number, status: "refunded" | "rejected") => void;
  isProcessing: boolean;
}

export default function RefundModal({
  isOpen,
  onClose,
  order,
  onRefund,
  isProcessing,
}: RefundModalProps) {
  if (!isOpen || !order) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>退款申請處理 - 訂單 #{order.order_id}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.summary}>
            <p>
              <strong>申請時間：</strong>{" "}
              {new Date(order.created_at).toLocaleString()}
            </p>
            <p>
              <strong>退款金額：</strong>{" "}
              <span className={styles.amount}>${order.total_price}</span>
            </p>
            <p>
              <strong>支付方式：</strong>{" "}
              {order.payment_methods === "cash" ? "現金" : "餘額"}
            </p>
          </div>

          <div className={styles.itemList}>
            <h4>退款商品明細</h4>
            {order.items.map((item) => (
              <div key={item.order_item_id} className={styles.itemRow}>
                <span>{item.product_name}</span>
                <span>x{item.quantity}</span>
                <span>${item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className={styles.actions}>
            <button
              className={styles.rejectBtn}
              onClick={() => onRefund(order.order_id, "rejected")}
              disabled={isProcessing}
            >
              拒絕退款
            </button>
            <button
              className={styles.approveBtn}
              onClick={() => onRefund(order.order_id, "refunded")}
              disabled={isProcessing}
            >
              同意退款
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
