import { useCart } from "@/components/molecules/CartConText";
import { useNavigate } from "react-router-dom";
import "./CartPage.css";

export default function CartPage() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const backToProductPage = () => navigate("/");

  return (
    <section className="cart-container">
      <h1 className="cart-title">購物車</h1>

      {cartItems.length === 0 ? (
        <p className="cart-empty">購物車是空的，快去逛逛吧！</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartItems.map((item, index) => (
              <li key={index} className="cart-item">
                <div>
                  <strong>{item.name}</strong>
                  <div className="cart-item-details">
                    {item.sugar && `糖度：${item.sugar} `}
                    {item.ice && `冰量：${item.ice} `}
                    {item.quantity && `數量：${item.quantity}`}
                    {item.note && <div>備註：{item.note}</div>}
                  </div>
                </div>
                <span className="cart-item-price">NT${item.price}</span>
              </li>
            ))}
          </ul>

          <div className="cart-footer">
            <div className="cart-total">
              總金額：<span className="cart-total-amount">NT${total}</span>
            </div>

            <div className="cart-buttons">
              <button onClick={backToProductPage}>繼續加點</button>
              <button onClick={clearCart}>清空</button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
