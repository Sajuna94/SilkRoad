import { useState, useMemo, useEffect, useCallback } from "react";
// 1. 只引入列表 Hook，不需要詳細 Hook 了
import { useUserOrders } from "@/hooks/order/order";
import styles from "./Orders.module.scss";
import { FadeInImage } from "@/components/atoms/FadeInImage";
// 引入 Type 定義
import type { OrderDetailItem } from "@/types/order";

const CAROUSEL_RADIUS = 800;
const ANGLE = 18;

// --- 子組件：改為純展示組件 (Presentational Component) ---
// 它只負責顯示傳進來的 items，不負責抓資料
const OrderCardDetails = ({ items }: { items: OrderDetailItem[] }) => {
    
    // 檢查是否有資料
    if (!items || items.length === 0) {
        return <div className={styles.detailPlaceholder}>此訂單尚無商品內容</div>;
    }

    return (
        <div className={styles.detailWrapper}>
            {items.map((item) => (
                <div key={item.order_item_id} className={styles.item}>
                    <div className={styles.area}>
                        {/* API 回傳的 product_image */}
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
    // 根據你提供的後端資料，user_id = 2 才有那筆測試訂單
    const customerId = 2; 

    // 2. 使用 API Hook 取得訂單列表 (包含 items)
    const { data: orders, isLoading, error } = useUserOrders(customerId);
    
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [rotateY, setRotateY] = useState(0);

    const carouselOrders = useMemo(() => orders || [], [orders]);

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

    const handleCardClick = useCallback(
        (index: number) => {
            const newRotateY = -index * ANGLE;
            setRotateY(newRotateY);
        },
        []
    );

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

    // --- 狀態處理 ---
    if (isLoading) return <p style={{textAlign:'center', marginTop: '100px'}}>載入訂單中...</p>;
    if (error) return <p style={{textAlign:'center', marginTop: '100px'}}>發生錯誤：{error.message}</p>;
    if (!orders || orders.length === 0) return <p style={{textAlign:'center', marginTop: '100px'}}>目前沒有訂單紀錄</p>;

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
                        const cardAngle = ANGLE * index;
                        const isSelected = selectedOrderId === order.order_id;

                        return (
                            <div
                                key={order.order_id}
                                className={`${styles.orderCard} ${isSelected ? styles.active : ""}`}
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
                                    <div className={styles.orderTotal}>NT$ {order.total_price}</div>
                                    <div style={{fontSize: '0.8rem', color: '#888'}}>
                                        {order.is_completed ? "已完成" : "製作中"} 
                                        {order.is_delivered ? " / 已送達" : ""}
                                    </div>
                                </div>

                                {/* ★ 修改重點：
                                    直接把 API 回傳的 order.items 傳進去，不需要再 Call API
                                */}
                                {isSelected ? (
                                    <OrderCardDetails items={order.items} />
                                ) : (
                                    <div className={styles.detailPlaceholder}>
                                        點擊查看詳情
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <button
                    className={styles.navButtonLeft}
                    onClick={(e) => { e.stopPropagation(); handleNavClick(-1); }}
                >
                    &lt;
                </button>
                <button
                    className={styles.navButtonRight}
                    onClick={(e) => { e.stopPropagation(); handleNavClick(1); }}
                >
                    &gt;
                </button>
            </div>
        </section>
    );
}