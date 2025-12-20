import { useEffect, useState, useRef } from "react";
import styles from "./Cart.module.scss";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import { Link } from "react-router-dom";
// 確保 api.ts 已定義這些函數
import { getCartData, createOrder, removeFromCart, getAvailablePolicies } from "@/api"; 

// 1. 定義商品型別，對齊後端 cart/view 輸出
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

// 2. 定義折價券型別，對齊後端 vendor/view_discount 輸出
interface PolicyFromBackend {
    policy_id: number;
    vendor_id: number;
    is_available: boolean;
    type: string;
    value: number;
    min_purchase: number;
    max_discount: number;
    expiry_date: string;
}

export default function Cart() {
    const [items, setItems] = useState<CartItemFromBackend[]>([]);
    const [coupons, setCoupons] = useState<PolicyFromBackend[]>([]); 
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState(""); 
    const [selectedPolicyId, setSelectedPolicyId] = useState<number | null>(null);

    // 暫代 ID，實務上由登入狀態取得
    const currentCustomerId = 1; 

    // B. 核心資料抓取邏輯
    const fetchData = async () => {
        try {
            // 第一步：取得購物車內容 (GET /cart/view/<id>)
            const cartRes = await getCartData(currentCustomerId);
            
            if (cartRes.data.success) {
                const cartList: CartItemFromBackend[] = cartRes.data.data;
                setItems(cartList);
                setTotalAmount(cartRes.data.total_amount);

                // 第二步：利用商品清單中的商店 ID 抓取該店專屬折價券 (POST /vendor/view_discount)
                if (cartList.length > 0) {
                    const targetVendorId = cartList[0].product_vendor_id;
                    const policyRes = await getAvailablePolicies(targetVendorId);
                    
                    if (policyRes.data.success) {
                        setCoupons(policyRes.data.data); // 後端回傳的 result_list
                    }
                }
            }
        } catch (err) {
            console.error("載入失敗", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // C. 移除商品處理 (POST /cart/remove)
    const handleRemoveItem = async (cartItemId: number) => {
        if (!confirm("確定要移除商品嗎？")) return;
        try {
            const res = await removeFromCart(cartItemId);
            if (res.data.success) {
                fetchData(); // 成功後自動更新列表
            }
        } catch (err) {
            alert("移除操作失敗");
        }
    };

    // D. 結帳付款邏輯 (POST /order/trans)
    const handleCheckout = async () => {
        if (items.length === 0) return alert("您的購物車目前是空的！");

        try {
            // 構建符合後端 trans_to_order 規格的 payload
            const payload = {
                customer_id: currentCustomerId,
                vendor_id: items[0].product_vendor_id,
                policy_id: selectedPolicyId, // 選中的 ID，若未選則為 null
                note: note,
                payment_methods: "cash",
            };

            const res = await createOrder(payload);
            if (res.data.success) {
                alert("付款結帳成功！");
                window.location.reload();
            } else {
                alert("失敗：" + res.data.message);
            }
        } catch (err) {
            alert("結帳連線異常");
        }
    };

    if (loading) return <div className={styles["container"]}>同步後端資料中...</div>;

    return (
        <section className={styles["container"]}>
            <header>購物車</header>

            <main>
                <CartList items={items} onRemove={handleRemoveItem} />
                <Sidebar 
                    couponList={coupons} 
                    selectedId={selectedPolicyId} 
                    setSelectedId={setSelectedPolicyId} 
                    note={note} 
                    setNote={setNote} 
                />
            </main>

            <footer>
                <div className={styles["cartOperation"]}>
                    <Link to="/home">繼續加點</Link>
                    <span>|</span>
                    <a onClick={() => alert("功能對接中")}>清空購物車</a>
                </div>

                <div className={styles["totalArea"]}>
                    {/* SCSS 已處理 content 偽元素顯示「總共/元」 */}
                    <div className={styles["total"]}>{totalAmount}</div>
                    <button 
                        onClick={handleCheckout} 
                        disabled={items.length === 0}
                    >
                        確認付款
                    </button>
                </div>
            </footer>
        </section>
    );
}

// 🛒 購物清單子組件
function CartList({ 
    items, 
    onRemove 
}: { 
    items: CartItemFromBackend[]; 
    onRemove: (id: number) => void 
}) {
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
                            <div>{item.selected_size} / {item.selected_ice} / {item.selected_sugar}</div>
                        </div>
                    </div>
                    <div className={styles["price"]}>
                        <h3>${item.subtotal}</h3>
                        <div className={styles["quantity"]}>{item.quantity}</div>
                        <button 
                            className={styles["btnRemove"]}
                            style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                            onClick={() => onRemove(item.cart_item_id)}
                        >
                            移除
                        </button>
                    </div>
                </li>
            ))}
        </ul>
    );
}

// 📑 側邊欄子組件 (處理真折價券顯示)
function Sidebar({ couponList, selectedId, setSelectedId, note, setNote }: any) {
    return (
        <section className={styles["sidebar"]}>
            <div className={styles["list"]}>
                <div>可用優惠</div>
                <hr />
                <ul>
                    {couponList && couponList.map((policy: any) => (
                        <li
                            key={policy.policy_id}
                            className={selectedId === policy.policy_id ? styles.selected : ""}
                            onClick={() => setSelectedId(selectedId === policy.policy_id ? null : policy.policy_id)}
                        >
                            <div className={styles["policyInfo"]}>
                                <span>{policy.type === '1' ? '滿額折' : '店內折扣'}</span>
                                <small>低消 ${policy.min_purchase}</small>
                            </div>
                            <div className={styles["discount"]}>{policy.value}</div>
                        </li>
                    ))}
                    {(!couponList || couponList.length === 0) && <p style={{ fontSize: '0.8rem', padding: '10px' }}>目前無可用優惠</p>}
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