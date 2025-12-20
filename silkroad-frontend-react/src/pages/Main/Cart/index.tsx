import { useEffect, useState, useRef } from "react";
import styles from "./Cart.module.scss";
import {
  ProductModal,
  type ProductModalRef,
} from "@/components/molecules/ProductModal";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import { Link } from "react-router-dom";
import { getCartData, createOrder, removeFromCart } from "@/api/instance";

// 1. 定義後端回傳的資料型別
interface CartItemFromBackend {
  cart_item_id: number;
  product_id: number;
  product_vendor_id: number; // 修正：確保 Interface 包含此欄位以消除紅線
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
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState("");

  // 暫代 ID，實作中應由登入狀態獲取
  const currentCustomerId = 1;

  // B. 資料抓取邏輯：封裝成獨立函式，以便在刪除後重複呼叫
  const fetchCart = async () => {
    try {
      const res = await getCartData(currentCustomerId);
      if (res.data.success) {
        setItems(res.data.data); // 對應後端的 result_list
        setTotalAmount(res.data.total_amount); // 對應後端的 total_price
      }
    } catch (err) {
      console.error("購物車對接失敗", err);
    } finally {
      setLoading(false);
    }
  };

  // 初次掛載時執行
  useEffect(() => {
    fetchCart();
  }, []);

  // C. 移除商品邏輯
  const handleRemoveItem = async (cartItemId: number) => {
    if (!confirm("確定要從購物車移除這項商品嗎？")) return;

    try {
      const res = await removeFromCart(cartItemId);
      if (res.data.success) {
        alert("已移除商品");
        fetchCart(); // 重新抓取資料，實現自動重新整理清單
      } else {
        alert("移除失敗：" + res.data.message);
      }
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
        customer_id: currentCustomerId,
        vendor_id: items[0].product_vendor_id || 1, // 從購物車項目動態獲取商店 ID
        note: note,
        payment_methods: "cash",
        // policy_id: selectedCoupon ? 某個ID : undefined
      };

      const res = await createOrder(payload);
      if (res.data.success) {
        alert("訂單建立成功！單號：" + res.data.order_id);
        fetchCart(); // 結帳完後清空/更新狀態
        setNote("");
      }
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
        <CartList items={items} onRemove={handleRemoveItem} />

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
}: {
  items: CartItemFromBackend[];
  onRemove: (id: number) => void;
}) {
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
      <ProductModal ref={modalRef} submitText="確認修改" />
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
