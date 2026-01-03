import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPortal } from "react-dom";
import { useCurrentUser } from "@/hooks/auth/user";
import { useUserOrders } from "@/hooks/order/order";
import styles from "./Orders.module.scss";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import ReviewInput from "@/components/molecules/ReviewInput/ReviewInput";
import type { OrderDetailItem, OrderSummary } from "@/types/order";

const X_OFFSET = 240;
const VISIBLE_COUNT = 4; // 左右各顯示幾張

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
  const [searchParams
    // , setSearchParams
] = useSearchParams();
  const selectedIdParam = searchParams.get("selected");

  const { data: currentUser } = useCurrentUser();
  const customerId = currentUser?.id || 0;

  const { data: orders, isLoading, error } = useUserOrders(customerId);

//   const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const [currentIndex, setCurrentIndex] = useState(0);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingOrderId, setReviewingOrderId] = useState<number | null>(null);

  const latestOrderIdRef = useRef<number | null>(null);

  const carouselOrders = useMemo(
    () => (orders as OrderSummary[]) || [],
    [orders]
  );

  useEffect(() => {
    if (carouselOrders.length > 0) {
      const currentNewestId = carouselOrders[0].order_id;

      // 情況 A: 第一次載入 (ref 是空的)
      if (latestOrderIdRef.current === null) {
        latestOrderIdRef.current = currentNewestId;
        // 第一次不跳轉，交給下面的初始化邏輯去處理 URL 定位
        return;
      }

      // 情況 B: 有新資料 (目前的最新 ID != 紀錄中的最新 ID)
      if (currentNewestId !== latestOrderIdRef.current) {
        console.log("偵測到新訂單！跳轉至最新");
        setCurrentIndex(0); // 強制跳到最新
        latestOrderIdRef.current = currentNewestId; // 更新紀錄
      }
    }
  }, [carouselOrders]);

  useEffect(() => {
    // 只有當資料存在，且尚未初始化過時才執行
    if (carouselOrders.length > 0 && !isInitialized) {
      if (selectedIdParam) {
        const targetId = parseInt(selectedIdParam, 10);
        const index = carouselOrders.findIndex((o) => o.order_id === targetId);

        if (index !== -1) {
          setCurrentIndex(index);
        } else {
          // 找不到 ID，預設回 0
          setCurrentIndex(0);
        }
      } else {
        // 沒有參數，預設回 0
        setCurrentIndex(0);
      }

      // 標記已初始化，之後 carouselOrders 更新或 currentIndex 改變都不再執行此邏輯
      setIsInitialized(true);
    }
  }, [carouselOrders, selectedIdParam, isInitialized]);

  const handleCardClick = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const handleJumpTo = (index: number) => {
    if (index >= 0 && index < carouselOrders.length) {
      setCurrentIndex(index);
    }
  };

  const handleOpenReview = (orderId: number) => {
    setReviewingOrderId(orderId);
    setIsReviewModalOpen(true);
  };

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
        <div className={styles.carouselTrack}>
          {carouselOrders.map((order: OrderSummary, index) => {
            const length = carouselOrders.length;

            // 計算相對於當前選中項目的距離 (正數在右，負數在左)
            let relativeIndex = index - currentIndex;

            // 環狀處理：如果距離太遠，代表它應該從另一端繞過來
            if (relativeIndex > length / 2) {
              relativeIndex -= length;
            } else if (relativeIndex < -length / 2) {
              relativeIndex += length;
            }

            const absDistance = Math.abs(relativeIndex);

            const isVisible = absDistance <= VISIBLE_COUNT;
            const isSelected = relativeIndex === 0;

            const translateX = relativeIndex * X_OFFSET;
            const scale = isSelected ? 1 : 0.85;
            const opacity = isVisible ? (isSelected ? 1 : 0.5) : 0;
            const zIndex = 100 - absDistance;

            return (
              <div
                key={order.order_id}
                className={`${styles.orderCard} ${
                  isSelected ? styles.active : ""
                }`}
                onClick={() => handleCardClick(index)}
                style={{
                  transform: `translateX(${translateX}px) scale(${scale})`,
                  zIndex: zIndex,
                  opacity: opacity,
                  visibility: isVisible ? "visible" : "hidden",
                  pointerEvents: isVisible ? "auto" : "none",
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

        <div className={styles.controls}>
          <button
            className={styles.jumpBtn}
            onClick={() => handleJumpTo(0)}
            title="最新訂單"
          >
            Latest
          </button>

          <button
            className={styles.jumpBtn}
            onClick={() => handleJumpTo(carouselOrders.length - 1)}
            title="最舊訂單"
          >
            Oldest
          </button>
        </div>
      </div>
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        orderId={reviewingOrderId}
      />
    </section>
  );
}
