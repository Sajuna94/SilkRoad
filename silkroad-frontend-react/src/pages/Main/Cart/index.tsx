import { useEffect, useState, useRef } from "react";
import styles from "./Cart.module.scss";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import { Link } from "react-router-dom";
// 確保 api.ts 包含 getCartData, createOrder, removeFromCart, getAvailablePolicies
import { getCartData, createOrder, removeFromCart, getAvailablePolicies } from "@/api"; 

// 1. 定義後端回傳的資料型別
interface CartItemFromBackend {
    cart_item_id: number;
    product_id: number;
    product_vendor_id: number; // 用於結帳 payload
    product_name: string;
    product_image: string;
    price: number;
    quantity: number;
    subtotal: number;
    selected_sugar: string;
    selected_ice: string;
    selected_size: string;
}

interface PolicyFromBackend {
    id: number;
    code: string;
    discount_amount: number;
}

export default function Cart() {
    // A. 狀態管理
    const [items, setItems] = useState<CartItemFromBackend[]>([]);
    const [coupons, setCoupons] = useState<PolicyFromBackend[]>([]); 
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState(""); 
    const [selectedCouponId, setSelectedCouponId] = useState<number | null>(null);

    // 暫代 ID，實作中應由登入狀態獲取
    const currentCustomerId = 1; 

    // B. 資料抓取邏輯
    const fetchData = async () => {
        try {
            // 同時抓取購物車與後端折價券資料
            const [cartRes, policyRes] = await Promise.all([
                getCartData(currentCustomerId), // GET /cart/view/<id>
                getAvailablePolicies()         // GET /order/policies
            ]);

            if (cartRes.data.success) {
                setItems(cartRes.data.data); // 對應 result_list
                setTotalAmount(cartRes.data.total_amount); // 對應 total_price
            }

            if (policyRes.data.success) {
                setCoupons(policyRes.data.policies); 
            }
        } catch (err) {
            console.error("資料載入失敗", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // C. 移除商品邏輯
    const handleRemoveItem = async (cartItemId: number) => {
        if (!confirm("確定要移除此商品嗎？")) return;
        try {
            // POST /cart/remove
            const res = await removeFromCart(cartItemId);
            if (res.data.success) {
                fetchData(); // 成功後重新整理
            }
        } catch (err) {
            alert("刪除失敗");
        }
    };

    // D. 結帳邏輯 (對應後端 /order/trans)
    const handleCheckout = async () => {
        if (items.length === 0) return alert("購物車是空的！");

        try {
            // 準備 JSON payload，包含 policy_id 以修正 ts(2345)
            const payload = {
                customer_id: currentCustomerId,
                vendor_id: items[0].product_vendor_id || 1,
                policy_id: selectedCouponId, // 若未選則為 null
                note: note,
                payment_methods: "cash",
            };

            const res = await createOrder(payload); // POST /order/trans
            if (res.data.success) {
                alert("結帳成功！");
                window.location.reload(); 
            }
        } catch (err) {
            alert("結帳發生錯誤");
        }
    };

    if (loading) return <div className={styles["container"]}>正在從伺服器同步資料...</div>;

    return (
        <section className={styles["container"]}>
            <header>購物車</header>

            <main>
                <CartList items={items} onRemove={handleRemoveItem} />
                
                {/* 傳入後端抓取的真 coupons */}
                <Sidebar 
                    couponList={coupons} 
                    selectedId={selectedCouponId} 
                    setSelectedId={setSelectedCouponId} 
                    note={note} 
                    setNote={setNote} 
                />
            </main>

            <footer>
                <div className={styles["cartOperation"]}>
                    <Link to="/home">繼續加點</Link>
                    <span>|</span>
                    <a onClick={() => alert("功能開發中")}>清空購物車</a>
                </div>

                <div className={styles["totalArea"]}>
                    {/* SCSS 會自動處理「總共」與「元」的文字 */}
                    <div className={styles["total"]}>{totalAmount}</div>
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

// 🛒 購物清單組件
function CartList({ items, onRemove }: { items: CartItemFromBackend[]; onRemove: (id: number) => void }) {
    return (
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
                        <div className={styles["quantity"]}>{item.quantity}</div>
                        <button 
                            onClick={() => onRemove(item.cart_item_id)} 
                            className={styles["btnRemove"]}
                            style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', marginTop: '5px' }}
                        >
                            移除
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

// 📑 側邊欄組件 (渲染後端折價券)
function Sidebar({ couponList, selectedId, setSelectedId, note, setNote }: any) {
    return (
        <section className={styles["sidebar"]}>
            <div className={styles["list"]}>
                <div>可用折價券</div>
                <hr />
                <ul>
                    {couponList && couponList.map((coupon: any) => (
                        <li
                            key={coupon.id}
                            className={selectedId === coupon.id ? styles.selected : ""}
                            onClick={() => setSelectedId(selectedId === coupon.id ? null : coupon.id)}
                        >
                            <span>{coupon.code}</span>
                            <div className={styles["discount"]}>{coupon.discount_amount}</div>
                        </li>
                    ))}
                </ul>
            </div>
            <div className={styles["note"]}>
                <div>訂單備註：</div>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="備註需求..."
                />
            </div>
        </section>
    );
}