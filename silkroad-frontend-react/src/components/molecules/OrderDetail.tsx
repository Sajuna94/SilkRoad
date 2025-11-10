import { useCart } from "@/components/molecules/CartConText";
import { useNavigate } from "react-router-dom";
// 未修改
export default function OrderDetail() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce((sum, item) => sum + item.price, 0);
  const backToProductPage = () => {
    navigate("/"); // 跳轉回商品頁面
  };

  return (
    <section
      style={{
        maxWidth: "700px",
        margin: "2rem auto",
        background: "#fff",
        padding: "2rem 3rem",
        borderRadius: "16px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.1)",
        fontFamily: "'Noto Sans TC', sans-serif",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          fontSize: "2rem",
          marginBottom: "1.5rem",
          color: "#222",
        }}
      >
        🛒 購物車
      </h1>

      {cartItems.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777", fontSize: "1.1rem" }}>
          購物車是空的，快去逛逛吧！
        </p>
      ) : (
        <>
          <ul style={{ listStyle: "none", padding: 0, marginBottom: "1.5rem" }}>
            {cartItems.map((item, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "0.75rem 0",
                  borderBottom: "1px solid #eee",
                }}
              >
                <span style={{ fontWeight: 600 }}>{item.name}</span>
                <span style={{ color: "#444" }}>NT${item.price}</span>
              </li>
            ))}
          </ul>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "1.2rem",
              fontSize: "1.2rem",
              fontWeight: "bold",
            }}
          >
            <span>總金額：</span>
            <span style={{ color: "#e53935" }}>NT${total}</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "2rem",
            }}
          >
            <button
              onClick={backToProductPage}
              style={{
                backgroundColor: "#4CAF50",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "background 0.3s",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#45a049")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#4CAF50")
              }
            >
              ➕ 繼續加點
            </button>

            <button
              onClick={clearCart}
              style={{
                backgroundColor: "#e53935",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                transition: "background 0.3s",
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#d32f2f")
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor =
                  "#e53935")
              }
            >
              🗑 清空購物車
            </button>
          </div>
        </>
      )}
    </section>
  );
}
