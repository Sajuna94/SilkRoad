import { useState } from "react";
import { useOrders } from "@/hooks/order/order";
import styles from "./OrderHistoryPage.module.scss";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import { products } from "@/types/data/product";

export default function OrderHistoryPage() {
  const customerId = 1;
  const { data: orders, isLoading, error } = useOrders(customerId);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  if (isLoading) return <p>載入中...</p>;
  if (error) return <p>發生錯誤：{error.message}</p>;
  if (!orders) return <p>沒有資料</p>;

  const selectedOrder = orders.find((o) => o.id === selectedOrderId);

  return (
    <section className={styles.historySection}>
      <h1 className={styles.title}>訂單紀錄</h1>

      {/* 橫向訂單列 */}
      <div className={styles.orderRow}>
        {orders.map((order) => (
          <div
            key={order.id}
            className={`${styles.orderCard} ${
              selectedOrderId === order.id ? styles.active : ""
            }`}
            onClick={() => setSelectedOrderId(order.id)}
          >
            <h3>訂單 {order.id}</h3>
            <p>{order.createdAt}</p>
            <div className={styles.orderTotal}>NT$ {order.total}</div>
          </div>
        ))}
      </div>

      {/* 下面顯示所選訂單明細 */}
      {selectedOrder && (
        <ul className={styles.itemList}>
          {selectedOrder.items.map((item) => {
            const product = products.find((p) => p.id === item.productId);
            return (
              <li key={item.productId} className={styles.item}>
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
                  {/* <h3>NT$ {item.price * item.quantity}</h3> */}
                  {/* 暫時用 10 代替 price */}
                  <h3>NT$ {10 * item.quantity}</h3>
                  <div className={styles.quantity}>{item.quantity}</div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
