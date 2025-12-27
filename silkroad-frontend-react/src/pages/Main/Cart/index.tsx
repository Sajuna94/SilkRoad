import { useEffect, useState, useRef } from "react";
import styles from "./Cart.module.scss";
import {
    ProductModal,
    type ProductModalRef,
} from "@/components/molecules/ProductModal";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import { Link } from "react-router-dom";

import {
    getCartData,
    createOrder,
    getAvailablePolicies,
} from "@/api/instance";
import { useCartItems, useRemoveFromCart, useUpdateCartItem, type CartItemData } from "@/hooks/order/cart";
import type { Product } from "@/types/store";

// 1. 定義商品型別，對齊後端 cart/view 輸出
// interface CartItemFromBackend {
//     cart_item_id: number;
//     product_id: number;
//     product_vendor_id: number;
//     product_name: string;
//     product_image: string;
//     price: number;
//     quantity: number;
//     subtotal: number;
//     selected_sugar: string;
//     selected_ice: string;
//     selected_size: string;
// }

// 2. 定義折價券型別，對齊後端 vendor/view_discount 輸出
interface PolicyFromBackend {
    id: number;
    code: string;
    discount_amount: number;
}

export default function Cart() {
    // A. 狀態管理
    const [items, setItems] = useState<CartItemData[]>([]);
    const [totalAmount, setTotalAmount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [note, setNote] = useState("");
    const [selectedCoupon, setSelectedCoupon] = useState("");

    // 暫代 ID，實作中應由登入狀態獲取
    //   const currentCustomerId = 1;
    const cartItemsQuery = useCartItems();
    const removeFromCartMutation = useRemoveFromCart();
    const updateCartItemMutation = useUpdateCartItem();

    // B. 資料抓取邏輯：封裝成獨立函式，以便在刪除後重複呼叫
    // const fetchCart = async () => {
    //     try {
    //         const res = await getCartData(currentCustomerId);
    //         if (res.data.success) {
    //             setItems(res.data.data); // 對應後端的 result_list
    //             setTotalAmount(res.data.total_amount); // 對應後端的 total_price
    //         }
    //     } catch (err) {
    //         console.error("購物車對接失敗", err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // 初次掛載時執行
    useEffect(() => {
        // fetchCart();
        console.log("Cart Items:", cartItemsQuery.data)
        if (cartItemsQuery.isSuccess) {
            setItems(cartItemsQuery.data.data);
            setTotalAmount(cartItemsQuery.data.total_amount);
            setLoading(false)
        }
    }, [cartItemsQuery.data]);

    // C. 移除商品邏輯
    const handleRemoveItem = async (cartItemId: number) => {
        if (!confirm("確定要從購物車移除這項商品嗎？")) return;

        try {
            await removeFromCartMutation.mutateAsync({ cart_item_id: cartItemId });
            alert("已移除商品");
            // React Query will automatically refetch cart data after successful removal
        } catch (err) {
            console.error("移除失敗", err);
            alert("移除發生錯誤");
        }
    };

    // D. 結帳處理邏輯
    const handleCheckout = async () => {
        if (items.length === 0) return alert("購物車是空的！");

        try {
            const payload = {
                // customer_id: currentCustomerId,
                // vendor_id: items[0].product_vendor_id || 1, // 從購物車項目動態獲取商店 ID
                note: note,
                payment_methods: "cash",
                // policy_id: selectedCoupon ? 某個ID : undefined
            };

            // const res = await createOrder(payload);
            // if (res.data.success) {
            //     alert("訂單建立成功！單號：" + res.data.order_id);
            //     // fetchCart(); // 結帳完後清空/更新狀態
            //     setNote("");
            // }
        } catch (err) {
            console.error("結帳失敗", err);
            alert("結帳失敗，請稍後再試");
        }
    };

    if (loading)
        return <div className={styles["container"]}>正在同步後端資料...</div>;

    return (
        <section className={styles["container"]}>
            <header>購物車</header>

            <main>
                {/* 將 items 與 handleRemoveItem 傳入 */}
                <CartList
                    items={items}
                    onRemove={handleRemoveItem}
                    updateMutation={updateCartItemMutation}
                />

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
                    <a onClick={() => alert("功能開發中")}>清空購物車</a>
                </div>

                <div className={styles["totalArea"]}>
                    <div className={styles["total"]}>${totalAmount}</div>
                    <button onClick={handleCheckout} disabled={items.length === 0}>
                        結帳
                    </button>
                </div>
            </footer>
        </section>
    );
}

// 🛒 購物清單子組件 (接收 onRemove)
function CartList({
    items,
    onRemove,
    updateMutation,
}: {
    items: CartItemData[];
    onRemove: (id: number) => void;
    updateMutation: ReturnType<typeof useUpdateCartItem>;
}) {
    const modalRef = useRef<ProductModalRef>(null);
    const [editingCartItemId, setEditingCartItemId] = useState<number | null>(null);

    // Handle cart item click - open modal for editing
    const handleItemClick = (item: CartItemData) => {
        setEditingCartItemId(item.cart_item_id);

        // Convert CartItemData to Product type for modal
        const product: Product = {
            id: item.product_id,
            vendor_id: item.vendor_id, // Use actual vendor_id to fetch product details
            name: item.product_name,
            price: item.price,
            description: "",
            options: {
                size: [],
                sugar: [],
                ice: [],
            },
            image_url: item.product_image,
            is_listed: true,
        };

        // Open modal with current quantity and selections
        modalRef.current?.open(product, item.quantity, {
            size: item.selected_size,
            ice: item.selected_ice,
            sugar: item.selected_sugar,
        });
    };

    // Handle modal submit - update cart item
    const handleUpdateSubmit = async (product: Product, form: { size: string; ice: string; sugar: string; quantity: number }) => {
        if (!editingCartItemId) return;

        try {
            await updateMutation.mutateAsync({
                cart_item_id: editingCartItemId,
                quantity: form.quantity,
                selected_size: form.size,
                selected_ice: form.ice,
                selected_sugar: form.sugar,
            });
            alert("購物車項目已更新");
            setEditingCartItemId(null);
        } catch (err) {
            console.error("更新失敗", err);
            alert("更新失敗，請稍後再試");
            throw err; // Re-throw to prevent modal from closing
        }
    };

    if (items.length === 0)
        return <p className={styles["empty"]}>您的購物車目前空空如也。</p>;

    return (
        <>
            <ul className={styles["list"]}>
                {items.map((item) => (
                    <li
                        key={item.cart_item_id}
                        className={styles["item"]}
                        onClick={() => handleItemClick(item)}
                        style={{ cursor: "pointer" }}
                    >
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

                            {/* 移除按鈕 */}
                            <button
                                className={styles["btnRemove"]}
                                style={{
                                    color: "red",
                                    border: "none",
                                    background: "none",
                                    cursor: "pointer",
                                    fontSize: "0.8rem",
                                    marginTop: "5px",
                                }}
                                onClick={(e) => {
                                    e.stopPropagation(); // 防止點擊觸發編輯彈窗
                                    onRemove(item.cart_item_id);
                                }}
                            >
                                移除項目
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <ProductModal ref={modalRef} submitText="確認修改" onSubmit={handleUpdateSubmit} />
        </>
    );
}

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
                            <div className={styles["discount"]}>100</div>
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
