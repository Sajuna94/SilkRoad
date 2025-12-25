import { useState, useMemo, useEffect, useCallback } from "react";
// 1. 引入我們剛剛寫好的 Hook
import { useUserOrders, useOrderDetails } from "@/hooks/order/order";
import styles from "./Orders.module.scss";
import { FadeInImage } from "@/components/atoms/FadeInImage";
// 移除本地 products 引用，因為現在 API 會直接回傳商品名稱與圖片
// import { products } from "@/types/data/product"; 

const CAROUSEL_RADIUS = 800;
const ANGLE = 18; // 將常數提取出來

// --- 新增：子組件，負責抓取並顯示單筆訂單的商品細項 ---
const OrderCardDetails = ({ 
    orderId, 
    userId, 
    vendorId, 
    active 
}: { 
    orderId: number; 
    userId: number; 
    vendorId: number; 
    active: boolean;
}) => {
    // 使用詳細資料 Hook
    // 效能優化：只有當 active (選中) 時才去 fetch，或者你可以拿掉 `enabled: active` 讓它預載
    const { data: detailData, isLoading } = useOrderDetails(orderId, userId, vendorId);

    if (isLoading) return <div className={styles.loadingItems}>載入商品中...</div>;
    
    // 如果沒有資料或是 items 為空
    if (!detailData || !detailData.data) return null;

    return (
        <div className={styles.detailWrapper}>
            {detailData.data.map((item) => (
                <div key={item.order_item_id} className={styles.item}>
                    <div className={styles.area}>
                        {/* API 直接回傳了 product_image */}
                        <FadeInImage fullSrc={item.product_image || ""} />
                    </div>
                    <div className={styles.options}>
                        {/* API 直接回傳了 product_name */}
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
    const customerId = 1; // 假設目前寫死 ID，之後可改從 Context/Auth 拿

    // 2. 改用 useUserOrders 取得列表摘要
    const { data: orders, isLoading, error } = useUserOrders(customerId);
    
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [rotateY, setRotateY] = useState(0);

    const carouselOrders = useMemo(() => orders || [], [orders]);

    const currentRotationIndex = useMemo(() => {
        if (carouselOrders.length === 0) return 0;
        return Math.round(-rotateY / ANGLE) % carouselOrders.length;
    }, [rotateY, carouselOrders.length]);

    useEffect(() => {
        if (carouselOrders.length > 0) {
            let index = currentRotationIndex;
            if (index < 0) index = carouselOrders.length + index;

            const newSelectedOrder = carouselOrders[index];
            // 注意：API 回傳的 key 是 order_id 不是 id
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

            // 修正索引計算邏輯
            // if (newIndex < 0) ... 邏輯對於無限旋轉可能需要調整，這裡維持你原本的邏輯
            if (newIndex < 0) newIndex = total - 1; 
            else if (newIndex >= total) newIndex = 0; // 簡易循環

            // 更好的無限旋轉邏輯通常是不重置 index，而是讓 rotateY 繼續加減
            // 但為了保持你的 layout 不變，這裡沿用原本邏輯
             handleCardClick(newIndex);
        },
        [rotateY, carouselOrders.length, handleCardClick]
    );

    // 初始載入選中第一張
    useEffect(() => {
        if (carouselOrders.length > 0) {
            // 這裡不需要再次 call handleCardClick(0) 因為初始 state rotateY 就是 0
            // 只需要設定 selectedOrderId
            setSelectedOrderId(carouselOrders[0].order_id);
        }
    }, [carouselOrders]); // 移除 handleCardClick 依賴避免迴圈

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
                        // 使用 order_id 比對
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
                                    {/* 使用 API 回傳的 total_price */}
                                    <div className={styles.orderTotal}>NT$ {order.total_price}</div>
                                    <div style={{fontSize: '0.8rem', color: '#888'}}>
                                        {order.is_completed ? "已完成" : "製作中"} 
                                        {order.is_delivered ? " / 已送達" : ""}
                                    </div>
                                </div>

                                {/* 3. 使用子組件來抓取並顯示細項 
                                    只有當卡片被選中(Active)時才顯示詳細內容，避免一次發送太多 API 請求
                                    如果你希望旁邊的卡片也顯示內容，可以把 active={true} 傳進去
                                */}
                                {isSelected ? (
                                    <OrderCardDetails 
                                        orderId={order.order_id} 
                                        userId={customerId}
                                        vendorId={order.vendor_id}
                                        active={isSelected}
                                    />
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