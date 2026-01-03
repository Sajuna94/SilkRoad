import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Cart.module.scss";
import {
  ProductModal,
  type ProductModalRef,
} from "@/components/molecules/ProductModal";
import { PolicyModal } from "@/components/molecules/PolicyModal/PolicyModal";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import { Link } from "react-router-dom";

import {
  useCartItems,
  useRemoveFromCart,
  useUpdateCartItem,
  type CartItemData,
} from "@/hooks/order/cart";
import { useCreateOrder } from "@/hooks/order/order";
import { useCurrentUser } from "@/hooks/auth/user";
import { useViewCustomerDiscountPolicies } from "@/hooks/order/discount";
import type { Product } from "@/types/store";
import type { CustomerDiscountPolicy } from "@/types/order";

export default function Cart() {
  const navigate = useNavigate();

  // A. 狀態管理
  const [items, setItems] = useState<CartItemData[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");

  // 新增：結帳相關狀態
  const [deliveryMethod, setDeliveryMethod] = useState<"delivery" | "pickup">(
    "pickup"
  );
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "button">("cash");
  const [selectedPolicy, setSelectedPolicy] =
    useState<CustomerDiscountPolicy | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);

  // B. Hooks
  const cartItemsQuery = useCartItems();
  const removeFromCartMutation = useRemoveFromCart();
  const updateCartItemMutation = useUpdateCartItem();
  const createOrderMutation = useCreateOrder();
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();

  // 取得折扣券列表（需要 vendor_id，僅登入用戶）
  const vendorId = items.length > 0 ? items[0].vendor_id : undefined;
  const discountPoliciesQuery = useViewCustomerDiscountPolicies(
    currentUser && vendorId ? vendorId : 0
  );

  // C. 初次掛載時執行
  useEffect(() => {
    if (cartItemsQuery.isSuccess) {
      setItems(cartItemsQuery.data.data);
      setTotalAmount(cartItemsQuery.data.total_amount);
      setLoading(false);
    }
  }, [cartItemsQuery.data]);

  // 預填用戶地址
  useEffect(() => {
    if (currentUser?.role === "customer") {
      setAddress(currentUser.address || "");
    }
  }, [currentUser]);

  // D. 計算折扣後的最終金額
  const calculateFinalAmount = () => {
    if (!selectedPolicy) return totalAmount;

    let discountAmount = 0;

    // 檢查是否符合最低消費
    if (
      selectedPolicy.min_purchase &&
      totalAmount < selectedPolicy.min_purchase
    ) {
      return totalAmount;
    }

    if (selectedPolicy.type === "percent") {
      // 百分比折扣：value 是折扣百分比（例如 20 代表 20% off）
      discountAmount = totalAmount * (selectedPolicy.value / 100);
    } else if (selectedPolicy.type === "fixed") {
      // 固定金額折扣
      discountAmount = selectedPolicy.value;
    }

    // 檢查最大折扣限制
    if (
      selectedPolicy.max_discount &&
      discountAmount > selectedPolicy.max_discount
    ) {
      discountAmount = selectedPolicy.max_discount;
    }

    return Math.max(totalAmount - discountAmount, 0);
  };

  const finalAmount = calculateFinalAmount();
  const discountAmount = totalAmount - finalAmount;

  // E. 移除商品邏輯
  const handleRemoveItem = async (cartItemId: number) => {
    if (!confirm("確定要從購物車移除這項商品嗎？")) return;

    try {
      await removeFromCartMutation.mutateAsync({ cart_item_id: cartItemId });
      alert("已移除商品");
    } catch (err) {
      console.error("移除失敗", err);
      alert("移除發生錯誤");
    }
  };

  const handleClearCart = async () => {
    if (items.length === 0) return;

    if (!confirm("確定要清空購物車嗎？這將移除所有商品。")) return;

    try {
      // 由於沒有專門的 clear API，先用 Promise.all 平行刪除所有項目
      // 如果後端有提供 useClearCart，請改用該 mutation
      await Promise.all(
        items.map((item) =>
          removeFromCartMutation.mutateAsync({
            cart_item_id: item.cart_item_id,
          })
        )
      );

      alert("購物車已清空");
      // 成功後，React Query 會自動重抓資料 (因為 useRemoveFromCart 應該有設 invalidateQueries)
      // 或者手動清空狀態
      setItems([]);
      setTotalAmount(0);
      setSelectedPolicy(null); // 清空購物車後，折扣券也要重置
    } catch (err) {
      console.error("清空購物車失敗", err);
      alert("清空部分商品失敗，請重試");
    }
  };

  // F. 過濾可用的折扣券
  const getAvailablePolicies = (): CustomerDiscountPolicy[] => {
    if (!discountPoliciesQuery.data || !currentUser) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return discountPoliciesQuery.data.data.filter((policy) => {
      // 檢查是否可用
      //   if (!policy.is_available) return false;

      // 檢查到期日
      if (policy.expiry_date) {
        const expiryDate = new Date(policy.expiry_date);
        if (expiryDate < today) return false;
      }

      // 檢查開始日期
      //   if (policy.start_date) {
      //     const startDate = new Date(policy.start_date);
      //     if (startDate > today) return false;
      //   }

      // 檢查會員等級
      if (
        currentUser.role === "customer" &&
        "membership_level" in currentUser
      ) {
        if (currentUser.membership_level < policy.membership_limit)
          return false;
      }

      // 檢查最低消費
      if (policy.min_purchase && totalAmount < policy.min_purchase)
        return false;

      return true;
    });
  };

  const availablePolicies = getAvailablePolicies();

  // G. 結帳驗證（僅對登入用戶）
  const validateCheckout = (): string | null => {
    if (items.length === 0) return "購物車是空的！";

    // 檢查配送地址
    if (deliveryMethod === "delivery" && !address.trim()) {
      return "請填寫配送地址";
    }

    // 檢查儲值餘額
    if (paymentMethod === "button" && currentUser) {
      const balance =
        currentUser.role === "customer" && "stored_balance" in currentUser
          ? currentUser.stored_balance
          : 0;

      if (balance < finalAmount) {
        return `儲值餘額不足！目前餘額：$${balance}，訂單金額：$${finalAmount}`;
      }
    }

    return null;
  };

  // H. 結帳處理邏輯
  const handleCheckout = async () => {
    // 訪客需要先登入
    if (!currentUser) {
      if (confirm("結帳需要登入，是否前往登入頁面？")) {
        navigate("/login");
      }
      return;
    }

    const error = validateCheckout();
    if (error) {
      alert(error);
      return;
    }

    try {
      const payload = {
        customer_id: currentUser.id,
        vendor_id: items[0].vendor_id,
        policy_id: selectedPolicy?.policy_id || null,
        note: note.trim(),
        payment_methods: paymentMethod,
        is_delivered: deliveryMethod === "delivery",
        shipping_address: address || "",
      };

      const result = await createOrderMutation.mutateAsync(payload);

      alert(`訂單建立成功！訂單編號：${result.order_id}`);

      // 跳轉到訂單詳情頁
      navigate(`/orders/${result.order_id}`);
    } catch (err: any) {
      console.error("結帳失敗", err);
      const errorMsg = err.response?.data?.message || "結帳失敗，請稍後再試";
      alert(errorMsg);
    }
  };

  if (loading || isUserLoading) {
    return <div className={styles["container"]}>正在載入...</div>;
  }

  return (
    <section className={styles["container"]}>
      <header>購物車</header>

      <main>
        {/* 購物車商品列表 */}
        <CartList
          items={items}
          onRemove={handleRemoveItem}
          updateMutation={updateCartItemMutation}
        />

        {/* 側邊欄：結帳資訊 */}
        <Sidebar
          note={note}
          setNote={setNote}
          deliveryMethod={deliveryMethod}
          setDeliveryMethod={setDeliveryMethod}
          address={address}
          setAddress={setAddress}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          selectedPolicy={selectedPolicy}
          setSelectedPolicy={setSelectedPolicy}
          availablePolicies={availablePolicies}
          onSelectPolicy={() => setShowPolicyModal(true)}
          currentUser={currentUser}
        />
      </main>

      {/* 折扣券選擇彈窗 */}
      {showPolicyModal && (
        <PolicyModal
          policies={availablePolicies}
          selectedPolicy={selectedPolicy}
          onSelect={setSelectedPolicy}
          onClose={() => setShowPolicyModal(false)}
        />
      )}

      {/* 頁腳：總計和結帳按鈕 */}
      <footer>
        <div className={styles["cartOperation"]}>
          <Link to={items.length > 0 ? `/vendor/${vendorId}` : "/home"}>
            繼續加點
          </Link>
          <span>|</span>
          <a
            onClick={handleClearCart}
            style={{
              cursor: items.length > 0 ? "pointer" : "not-allowed",
              opacity: items.length > 0 ? 1 : 0.5,
            }}
          >
            清空購物車
          </a>
        </div>

        <div className={styles["totalArea"]}>
          <div className={styles["summary"]}>
            <div>小計：${totalAmount}</div>
            {discountAmount > 0 && (
              <div style={{ color: "green" }}>折扣：-${discountAmount}</div>
            )}
            <div className={styles["total"]}>總計：${finalAmount}</div>
          </div>
          <button
            onClick={handleCheckout}
            disabled={items.length === 0 || createOrderMutation.isPending}
          >
            {createOrderMutation.isPending
              ? "處理中..."
              : !currentUser
              ? "登入後結帳"
              : "結帳"}
          </button>
        </div>
      </footer>
    </section>
  );
}

// 購物清單子組件
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
  const [editingCartItemId, setEditingCartItemId] = useState<number | null>(
    null
  );

  const handleItemClick = (item: CartItemData) => {
    setEditingCartItemId(item.cart_item_id);

    const product: Product = {
      id: item.product_id,
      vendor_id: item.vendor_id,
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

    modalRef.current?.open(product, item.quantity, {
      size: item.selected_size,
      ice: item.selected_ice,
      sugar: item.selected_sugar,
    });
  };

  const handleUpdateSubmit = async () =>
    // form: { size: string; ice: string; sugar: string; quantity: number }
    {
      if (!editingCartItemId) return;

      const form = modalRef.current?.getForm();
      if (!form) return;

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
        throw err;
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
                  e.stopPropagation();
                  onRemove(item.cart_item_id);
                }}
              >
                移除項目
              </button>
            </div>
          </li>
        ))}
      </ul>
      <ProductModal
        ref={modalRef}
        submitText="確認修改"
        onSubmit={handleUpdateSubmit}
      />
    </>
  );
}

// 側邊欄：結帳資訊
function Sidebar({
  note,
  setNote,
  deliveryMethod,
  setDeliveryMethod,
  address,
  setAddress,
  paymentMethod,
  setPaymentMethod,
  selectedPolicy,
  setSelectedPolicy,
  availablePolicies,
  onSelectPolicy,
  currentUser,
}: {
  note: string;
  setNote: (note: string) => void;
  deliveryMethod: "delivery" | "pickup";
  setDeliveryMethod: (method: "delivery" | "pickup") => void;
  address: string;
  setAddress: (address: string) => void;
  paymentMethod: "cash" | "button";
  setPaymentMethod: (method: "cash" | "button") => void;
  selectedPolicy: CustomerDiscountPolicy | null;
  setSelectedPolicy: (policy: CustomerDiscountPolicy | null) => void;
  availablePolicies: CustomerDiscountPolicy[];
  onSelectPolicy: () => void;
  currentUser: any;
}) {
  const balance =
    currentUser?.role === "customer" && "stored_balance" in currentUser
      ? currentUser.stored_balance
      : 0;

  return (
    <section className={styles["sidebar"]}>
      <div className={styles["section"]}>
        <h3>配送方式</h3>
        <div className={styles["radioGroup"]}>
          <label>
            <input
              type="radio"
              name="delivery"
              checked={deliveryMethod === "pickup"}
              onChange={() => setDeliveryMethod("pickup")}
            />
            自取
          </label>
          <label>
            <input
              type="radio"
              name="delivery"
              checked={deliveryMethod === "delivery"}
              onChange={() => setDeliveryMethod("delivery")}
            />
            外送
          </label>
        </div>
      </div>

      {/* 配送地址（僅外送時顯示） */}
      {deliveryMethod === "delivery" && (
        <div className={styles["section"]}>
          <h3>配送地址</h3>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="請輸入配送地址"
            className={styles["input"]}
          />
        </div>
      )}

      <div className={styles["section"]}>
        <h3>支付方式</h3>
        <div className={styles["radioGroup"]}>
          <label>
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cash"}
              onChange={() => setPaymentMethod("cash")}
            />
            現金
          </label>
          {currentUser && (
            <label>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "button"}
                onChange={() => setPaymentMethod("button")}
              />
              儲值餘額 (目前：${balance})
            </label>
          )}
        </div>
      </div>

      {/* 折扣券選擇（僅登入用戶） */}
      {currentUser && (
        <div className={styles["section"]}>
          <h3>折扣券</h3>
          <button
            className={styles["policyBtn"]}
            onClick={onSelectPolicy}
            disabled={availablePolicies.length === 0}
          >
            {selectedPolicy
              ? `已選：${
                  selectedPolicy.code || `折扣券 #${selectedPolicy.policy_id}`
                }`
              : availablePolicies.length > 0
              ? `選擇折扣券 (${availablePolicies.length} 張可用)`
              : "無可用折扣券"}
          </button>
          {selectedPolicy && (
            <button
              className={styles["clearPolicyBtn"]}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPolicy(null);
              }}
            >
              清除折扣券
            </button>
          )}
        </div>
      )}

      <div className={styles["section"]}>
        <h3>訂單備註</h3>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="例如：不要塑膠袋..."
          className={styles["textarea"]}
        />
      </div>
    </section>
  );
}

// function PolicyModal({
//   policies,
//   selectedPolicy,
//   onSelect,
//   onClose,
// }: {
//   policies: CustomerDiscountPolicy[];
//   selectedPolicy: CustomerDiscountPolicy | null;
//   onSelect: (policy: CustomerDiscountPolicy | null) => void;
//   onClose: () => void;
// }) {
//   const handleSelect = (policy: CustomerDiscountPolicy) => {
//     onSelect(policy);
//     onClose();
//   };

//   return (
//     <div className={styles["modal"]} onClick={onClose}>
//       <div
//         className={styles["modalContent"]}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <h2>選擇折扣券</h2>
//         <div className={styles["policyList"]}>
//           {policies.map((policy) => (
//             <div
//               key={policy.policy_id}
//               className={`${styles["policyItem"]} ${
//                 selectedPolicy?.policy_id === policy.policy_id
//                   ? styles["selected"]
//                   : ""
//               }`}
//               onClick={() => handleSelect(policy)}
//             >
//               <div className={styles["policyHeader"]}>
//                 <span className={styles["policyCode"]}>
//                   {policy.code || `折扣券 #${policy.policy_id}`}
//                 </span>
//                 <span className={styles["policyValue"]}>
//                   {policy.type === "percent"
//                     ? `${policy.value}% OFF`
//                     : `$${policy.value} OFF`}
//                 </span>
//               </div>
//               <div className={styles["policyDetails"]}>
//                 {policy.min_purchase > 0 && (
//                   <div>最低消費：${policy.min_purchase}</div>
//                 )}
//                 {policy.max_discount && (
//                   <div>最高折抵：${policy.max_discount}</div>
//                 )}
//                 {policy.expiry_date && <div>到期日：{policy.expiry_date}</div>}
//               </div>
//             </div>
//           ))}
//         </div>
//         <button className={styles["closeBtn"]} onClick={onClose}>
//           關閉
//         </button>
//       </div>
//     </div>
//   );
// }
