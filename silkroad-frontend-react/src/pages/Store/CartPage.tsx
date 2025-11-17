// import { useNavigate } from "react-router-dom";
import styles from "./CartPage.module.scss";
import {
  ProductModal,
  type ProductModalRef,
} from "@/components/molecules/ProductModal/ProductModal";
import { useRef, useState } from "react";
import { products } from "@/types/data/product";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import type { CartItem } from "@/types/order";
import type { Product } from "@/types/store";
import { cartItems } from "@/types/data/cartitem";
// import { useCart } from "@/components/molecules/CartContext";

// 也可以讓 cartItem 額外回傳 products
// TODO: useCartItemsWithProducts()
type CartItemWithRelations = CartItem & { product: Product };
const items: CartItemWithRelations[] = cartItems.map((cartItem, index) => {
  return {
    ...cartItem,
    product: products[index]!, // 假設一定能找到對應的 product
  };
});

export default function CartPage() {
  const baseTotal = items.reduce(
    (acc, t) => acc + t.product.price * t.quantity,
    0
  );
  return (
    <section className={styles["container"]}>
      <header className={styles["title"]}>購物車</header>

      <main>
        <CartList />
        <Sidebar />
      </main>

      <footer>
        <div className={styles["cartOperation"]}>
          <a href="/SilkRoad/">繼續加點</a>
          {/* TODO: 清除購物車 */}
          <span>|</span>
          <a
            onClick={() => {
              console.log("TODO: clear cart");
            }}
          >
            清空購物車
          </a>
        </div>

        <div className={styles["totalArea"]}>
          <div className={styles["total"]}>{baseTotal}</div>
          {/* TODO: 結帳檢查購物車是否empty\nhook argu: coupon code */}
          <button>結帳</button>
        </div>
      </footer>
    </section>
  );
}

function CartList() {
  const modalRef = useRef<ProductModalRef>(null);

  if (items.length === 0)
    return <p className="cart__empty">購物車是空的，快去逛逛吧！</p>;

  return (
    <>
      <ul className={styles["list"]}>
        {items.map((item, index) => {
          return (
            <li
              key={index}
              className={styles["item"]}
              onClick={() => modalRef.current?.open(item.product)}
            >
              <div className={styles["area"]}>
                <FadeInImage fullSrc={item.product.url} />
              </div>
              <div className={styles["options"]}>
                <h3>{item.product.name}</h3>
                <div className="flex">
                  <div>{item.options.size}</div>
                  <div>{item.options.ice}</div>
                  <div>{item.options.sugar}</div>
                </div>
              </div>
              <div className={styles["price"]}>
                <h3>{item.product.price * item.quantity}</h3>
                <div className={styles["quantity"]}>{item.quantity}</div>
              </div>
            </li>
          );
        })}
      </ul>
      <ProductModal isEditMode={true} ref={modalRef} />
    </>
  );
}

function Sidebar() {
  // const [discount, setDiscount] = useState(0);
  const [note, setNote] = useState("");
  const [selected, setSelected] = useState<string>("");
  const coupons = [
    "VIP666",
    "VIP888",
    "VIP999",
    "NTUT",
    "CSIE",
    "2486",
    "HTML777",
    "ERD666",
  ];

  return (
    <section className={styles["sidebar"]}>
      {/* <div className={styles["code"]}>
        <input value={code} onChange={() => setCode(code)} /> */}
      {/* TODO 向後端發送 code 確認是否存在 以及是否為該用戶的? 之類，不回傳 coupon*/}
      {/* <button>輸入折扣碼</button>
      </div> */}
      <div className={styles["list"]}>
        <div>折價券</div>
        <hr></hr>
        <ul>
          {coupons.map((code) => (
            <li
              key={code}
              className={selected === code ? styles.selected : ""}
              onClick={() => {
                setSelected((prev) => (prev === code ? "" : code));
              }}
            >
              <span>{code}</span>
              <div className={styles["discount"]}>100</div>
              {/* TODO: 折扣金額，如果是百分比可以直接換算 */}
            </li>
          ))}
        </ul>
      </div>
      <div className={styles["note"]}>
        <div>備註：</div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="想告訴店家的話..."
        />
      </div>
    </section>
  );
}

{
  /* <div >
				<ul className="list">
					{cartItems.map((item, index) => (
						<li key={index} className="item">
							<div className={"itemImgArea"}>
								<FadeInImage fullSrc={url} />
							</div>
							<div className={"itemContent"} onClick={() => modalRef.current?.open(products[index])}>
								<div className="contentLeft">
									<h3>{item.name}</h3>
									<div>小</div>
									<div>{item.ice}</div>
									<div>{item.sugar}</div>
								</div>
								<div className="contentRight">
									<h3>NT$ {item.price}</h3>
									<div>數量: {item.quantity}</div>
								</div>
							</div>
						</li>
					))}
				</ul>
				<div className="discountCotainer"></div>
			</div>

			<div className="footer">
				<div className="total">
					NT${total}
				</div>

				<div className="buttons">
					<button onClick={backToProductPage}>繼續加點</button>
					<button onClick={clearCart}>清空</button>
				</div>
			</div> */
}
