import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCurrentUser } from "@/hooks/auth/user";
import { useUserOrders } from "@/hooks/order/order";
import styles from "./Orders.module.scss";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import ReviewInput from "@/components/molecules/ReviewInput/ReviewInput";
import type { OrderDetailItem, OrderSummary } from "@/types/order";

const CAROUSEL_RADIUS = 800;
const ANGLE = 18;

const ReviewModal = ({
  isOpen,
  onClose,
  orderId,
}: {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}) => {
  if (!isOpen || !orderId) return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>
        <ReviewInput orderId={orderId} onSubmitSuccess={onClose} />
      </div>
    </div>,
    document.body
  );
};

const OrderCardDetails = ({ items }: { items: OrderDetailItem[] }) => {
  if (!items || items.length === 0) {
    return <div className={styles.detailPlaceholder}>此訂單尚無商品內容</div>;
  }

  return (
    <div className={styles.detailWrapper}>
      {items.map((item) => (
        <div key={item.order_item_id} className={styles.item}>
          <div className={styles.area}>
            <FadeInImage fullSrc={item.product_image || ""} />
          </div>
          <div className={styles.options}>
            <h3>{item.product_name}</h3>
            <div>{item.selected_size}</div>
            <div>{item.selected_ice}</div>
            <div>{item.selected_sugar}</div>
          </div>
          <div className={styles.price}>
            <div className={styles.quantity}>x{item.quantity}</div>
            <div className={styles.subtotal}>${item.subtotal}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function History() {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();
  const customerId = currentUser!.id;

  // 2. 使用 API Hook 取得訂單列表 (包含 items)
  const { data: orders, isLoading, error } = useUserOrders(customerId);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [rotateY, setRotateY] = useState(0);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingOrderId, setReviewingOrderId] = useState<number | null>(null);

  const carouselOrders = useMemo(
    () => (orders as OrderSummary[]) || [],
    [orders]
  );

  // 計算目前的旋轉索引
  const currentRotationIndex = useMemo(() => {
    if (carouselOrders.length === 0) return 0;
    return Math.round(-rotateY / ANGLE) % carouselOrders.length;
  }, [rotateY, carouselOrders.length]);

  // 當旋轉改變時，同步更新選中的 Order ID
  useEffect(() => {
    if (carouselOrders.length > 0) {
      let index = currentRotationIndex;
      if (index < 0) index = carouselOrders.length + index;

      const newSelectedOrder = carouselOrders[index];
      setSelectedOrderId(newSelectedOrder?.order_id || null);
    }
  }, [carouselOrders, currentRotationIndex]);

  const handleCardClick = useCallback((index: number) => {
    const newRotateY = -index * ANGLE;
    setRotateY(newRotateY);
  }, []);

  const handleNavClick = useCallback(
    (direction: 1 | -1) => {
      const total = carouselOrders.length;
      if (total === 0) return;

      const currentIndex = Math.round(-rotateY / ANGLE);
      let newIndex = currentIndex + direction;

      if (newIndex < 0) newIndex = total - 1;
      else if (newIndex >= total) newIndex = 0;

      handleCardClick(newIndex);
    },
    [rotateY, carouselOrders.length, handleCardClick]
  );

  // 初始載入時選中第一張
  useEffect(() => {
    if (carouselOrders.length > 0) {
      setSelectedOrderId(carouselOrders[0].order_id);
    }
  }, [carouselOrders]);

  const handleOpenReview = (orderId: number) => {
    setReviewingOrderId(orderId);
    setIsReviewModalOpen(true);
  };

  // --- 狀態處理 ---
  if (isLoading)
    return (
      <p style={{ textAlign: "center", marginTop: "100px" }}>載入訂單中...</p>
    );
  if (error)
    return (
      <p style={{ textAlign: "center", marginTop: "100px" }}>
        發生錯誤：{error.message}
      </p>
    );
  if (!orders || orders.length === 0)
    return (
      <p style={{ textAlign: "center", marginTop: "100px" }}>
        目前沒有訂單紀錄
      </p>
    );

  return (
    <section className={styles.historySection} style={{ paddingTop: "60px" }}>
      <h1 className={styles.title}>訂單紀錄</h1>

      <div className={styles.carouselContainer}>
        <div
          className={styles.carousel}
          style={{
            transform: `rotateY(${rotateY}deg)`,
          }}
        >
          {carouselOrders.map((order: OrderSummary, index) => {
            const cardAngle = ANGLE * index;
            const isSelected = selectedOrderId === order.order_id;

            return (
              <div
                key={order.order_id}
                className={`${styles.orderCard} ${
                  isSelected ? styles.active : ""
                }`}
                onClick={() => handleCardClick(index)}
                style={{
                  transform: `rotateY(${cardAngle}deg) translateZ(${
                    isSelected ? CAROUSEL_RADIUS + 60 : CAROUSEL_RADIUS
                  }px)`,
                }}
              >
                <div className={styles.orderInfo}>
                  <h3>訂單 #{order.order_id}</h3>
                  <p>{order.created_at}</p>
                  <div className={styles.orderTotal}>
                    NT$ {order.total_price}
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#888" }}>
                    {order.refund_status === "refunded" ? (
                      <span style={{ color: "#ef4444", fontWeight: "bold" }}>
                        已退款
                      </span>
                    ) : (
                      <>
                        {order.is_completed ? "已完成" : "製作中"}
                        {order.is_delivered ? " / 已送達" : ""}
                        {order.refund_status === "pending" && (
                          <span style={{ color: "#f97316", marginLeft: "5px" }}>
                            (退款審核中)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isSelected ? (
                  <>
                    <OrderCardDetails items={order.items} />

                    <div className={styles.actionButtons}>
                      <button
                        className={`${styles.textLink} ${styles.detailLink}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/orders/${order.order_id}`);
                        }}
                      >
                        查看完整訂單
                      </button>

                      {order.is_completed &&
                        order.refund_status !== "refunded" && (
                          <button
                            className={`${styles.textLink} ${styles.reviewLink}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenReview(order.order_id);
                            }}
                          >
                            撰寫評論
                          </button>
                        )}
                    </div>
                  </>
                ) : (
                  <div className={styles.detailPlaceholder}>點擊查看詳情</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className={styles.navButtonLeft}
          onClick={(e) => {
            e.stopPropagation();
            handleNavClick(-1);
          }}
        >
          &lt;
        </button>
        <button
          className={styles.navButtonRight}
          onClick={(e) => {
            e.stopPropagation();
            handleNavClick(1);
          }}
        >
          &gt;
        </button>
      </div>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={reviewingOrderId}
      />
    </section>
  );
}
