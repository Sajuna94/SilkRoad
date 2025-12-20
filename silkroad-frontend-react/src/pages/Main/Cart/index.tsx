import { useEffect, useState, useRef } from "react";
import styles from "./Cart.module.scss";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import { Link } from "react-router-dom";
import { getCartData, createOrder } from "@/api"; // 確保你的 api.ts 有導出這兩個函式

// 1. 定義後端回傳的資料型別，對齊你的 SQL 與 JSON 輸出
interface CartItemFromBackend {
    cart_item_id: number;
    product_id: number;
	product_vendor_id: number;
    product_name: string;
    product_image: string;
    price: number;
    quantity: number;
    subtotal: number;
    selected_sugar: string;
    selected_ice: string;
    selected_size: string;
}

export default function Cart() {
    // A. 狀態管理
    const [items, setItems] = useState<CartItemFromBackend[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState(""); // 備註狀態
    const [selectedCoupon, setSelectedCoupon] = useState(""); // 選中的折價券

    // 暫代 ID，實作中應由登入狀態獲取
    const currentCustomerId = 1; 

    // B. 生命週期：組件掛載時抓取後端購物車真資料
    useEffect(() => {
        const fetchCart = async () => {
            try {
                // 呼叫你的後端路由 /api/cart/view/<id>
                const res = await getCartData(currentCustomerId);
                if (res.data.success) {
                    setItems(res.data.data); // 對應你的 result_list
                    setTotalAmount(res.data.total_amount); // 對應你的 total_price
                }
            } catch (err) {
                console.error("購物車對接失敗，請檢查後端與 CORS 設定", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    // C. 結帳處理邏輯 (對接你的 generate_new_order)
    const handleCheckout = async () => {
        if (items.length === 0) return alert("購物車是空的！");

        try {
            const payload = {
                customer_id: currentCustomerId,
                vendor_id: items[0].product_vendor_id || 1, // 暫時假設，實作應從 items[0] 取得對應商店
                note: note,
                payment_methods: "cash", // 預設支付方式
                // policy_id: selectedCoupon ? 某個ID : undefined
            };

            const res = await createOrder(payload);
            if (res.data.success) {
                alert("訂單建立成功！單號：" + res.data.order_id);
                // 重新載入購物車或導向訂單頁
                window.location.reload();
            }
        } catch (err) {
            console.error("結帳失敗", err);
            alert("結帳失敗，請稍後再試");
        }
    };

    if (loading) return <div className={styles["container"]}>正在同步後端資料...</div>;

    return (
        <section className={styles["container"]}>
            <header>購物車</header>

            <main>
                {/* 傳入真資料給清單組件 */}
                <CartList items={items} />
                
                {/* 傳入狀態控制給側邊欄 */}
                <Sidebar 
                    note={note} 
                    setNote={setNote} 
                    selected={selectedCoupon} 
                    setSelected={setSelectedCoupon} 
                />
            </main>

            <footer>
                <div className={styles["cartOperation"]}>
                    <Link to="/home">繼續加點</Link>
                    <span>|</span>
                    <a onClick={() => alert("清空功能對接中")}>清空購物車</a>
                </div>

                <div className={styles["totalArea"]}>
                    {/* 顯示後端精確計算的總金額 */}
                    <div className={styles["total"]}>${totalAmount}</div>
                    <button 
                        onClick={handleCheckout} 
                        disabled={items.length === 0}
                    >
                        結帳
                    </button>
                </div>
            </footer>
        </section>
    );
}

// 🛒 購物清單子組件
function CartList({ items }: { items: CartItemFromBackend[] }) {
    const modalRef = useRef<ProductModalRef>(null);

    if (items.length === 0)
        return <p className={styles["empty"]}>您的購物車目前空空如也。</p>;

    return (
        <>
            <ul className={styles["list"]}>
                {items.map((item) => (
                    <li key={item.cart_item_id} className={styles["item"]}>
                        <div className={styles["area"]}>
                            <FadeInImage fullSrc={item.product_image} />
                        </div>
                        <div className={styles["options"]}>
                            <h3>{item.product_name}</h3>
                            <div className="flex">
                                <div>規格: {item.selected_size}</div>
                                <div>冰塊: {item.selected_ice}</div>
                                <div>糖度: {item.selected_sugar}</div>
                            </div>
                        </div>
                        <div className={styles["price"]}>
                            <h3>${item.subtotal}</h3>
                            <div className={styles["quantity"]}>數量: {item.quantity}</div>
                        </div>
                    </li>
                ))}
            </ul>
            {/* TODO: 串接修改 API */}
            <ProductModal ref={modalRef} submitText="確認修改" />
        </>
    );
}

// 📑 側邊欄子組件 (處理備註與折扣)
function Sidebar({ note, setNote, selected, setSelected }: any) {
    const coupons = ["VIP666", "VIP888", "VIP999", "NTUT"];

    return (
        <section className={styles["sidebar"]}>
            <div className={styles["list"]}>
                <div>可用折價券</div>
                <hr />
                <ul>
                    {coupons.map((code) => (
                        <li
                            key={code}
                            className={selected === code ? styles.selected : ""}
                            onClick={() => setSelected(selected === code ? "" : code)}
                        >
                            <span>{code}</span>
                            <div className={styles["discount"]}>可抵 $100</div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles["note"]}>
                <div>訂單備註：</div>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="例如：珍珠多一點、不要塑膠袋..."
                />
            </div>
        </section>
    );
}