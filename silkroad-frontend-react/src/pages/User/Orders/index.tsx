import { useState, useMemo, useEffect, useCallback } from "react";
import { useOrders } from "@/hooks/order/order";
import styles from "./Orders.module.scss";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import { products } from "@/types/data/product";

// 定義環繞半徑
const CAROUSEL_RADIUS = 800;

export default function History() {
  const customerId = 1;
  const { data: orders, isLoading, error } = useOrders(customerId);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [rotateY, setRotateY] = useState(0 as number);

  const angle = 18;

  const carouselOrders = orders!;

  const currentRotationIndex = useMemo(() => {
    return Math.round(-rotateY / angle) % carouselOrders.length;
  }, [rotateY, angle, carouselOrders.length]);

  useEffect(() => {
    if (carouselOrders.length > 0) {
      let index = currentRotationIndex;
      if (index < 0) index = carouselOrders.length + index;

      const newSelectedOrder = carouselOrders[currentRotationIndex];
      setSelectedOrderId(newSelectedOrder?.id || null);
    }
  }, [carouselOrders, currentRotationIndex]);

  const handleCardClick = useCallback(
    (index: number) => {
      const newRotateY = -index * angle;
      setRotateY(newRotateY);
    },
    [angle]
  );

  const handleNavClick = useCallback(
    (direction: 1 | -1) => {
      const total = carouselOrders.length;
      const currentIndex = Math.round(-rotateY / angle);
      let newIndex = currentIndex + direction;

      if (newIndex < 0) {
        newIndex = total - 1;
      } else if (newIndex >= total) {
        newIndex = 0;
      }

      handleCardClick(newIndex);
    },
    [rotateY, angle, carouselOrders.length, handleCardClick]
  );

  useEffect(() => {
    if (carouselOrders.length > 0) {
      handleCardClick(0);
    }
  }, [carouselOrders.length, handleCardClick]);

  if (isLoading) return <p>載入中...</p>;
  if (error) return <p>發生錯誤：{error.message}</p>;
  if (!orders) return <p>沒有資料</p>;

  //   const selectedOrder = orders.find((o) => o.id === selectedOrderId);

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
          {carouselOrders.map((order, index) => {
            const cardAngle = angle * index;
            const isSelected = selectedOrderId === order.id;

            return (
              <div
                key={order.id}
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
                  <h3>訂單 {order.id}</h3>
                  <p>{order.createdAt}</p>
                  <div className={styles.orderTotal}>NT$ {order.total}</div>
                </div>

                <div className={styles.detailWrapper}>
                  {order?.items.map((item) => {
                    const product = products.find(
                      (p) => p.id === item.productId
                    );
                    return (
                      <div key={item.productId} className={styles.item}>
                        <div className={styles.area}>
                          <FadeInImage fullSrc={product?.url ?? ""} />
                        </div>
                        <div className={styles.options}>
                          <h3>{product?.name ?? `商品 ${item.productId}`}</h3>
                          <div>{item.options?.size}</div>
                          <div>{item.options?.ice}</div>
                          <div>{item.options?.sugar}</div>
                        </div>
                        <div className={styles.price}>
                          <div className={styles.quantity}>{item.quantity}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <button
          className={styles.navButtonLeft}
          onClick={() => handleNavClick(-1)}
        >
          &lt;
        </button>
        <button
          className={styles.navButtonRight}
          onClick={() => handleNavClick(1)}
        >
          &gt;
        </button>
      </div>
    </section>
  );
}
