import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal/ProductModal";
import { useRef } from "react";
import { products } from "@/assets/data/drink";
// import { useCart } from "@/components/molecules/CartContext";

export default function CartPage() {
	const modalRef = useRef<ProductModalRef>(null);

	// const { cartItems, clearCart } = useCart();

	const cartItems = [
		{
			name: "柳橙汁",
			price: 50,
			sugar: "正常糖",
			ice: "少冰",
			quantity: 2,
			note: "不要太酸",
		},
		{
			name: "珍珠奶茶",
			price: 65,
			sugar: "少糖",
			ice: "微冰",
			quantity: 1,
			note: "加珍珠多一點",
		},
		{
			name: "抹茶拿鐵",
			price: 70,
			sugar: "無糖",
			ice: "去冰",
			quantity: 1,
			note: "",
		},
	];

	// 假的 clearCart function
	const clearCart = () => {
		alert("清空購物車（假資料）");
	};

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
							<li key={index} className="cart-item" onClick={() => modalRef.current?.open(products[index])}>
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

			<ProductModal isEditMode={true} ref={modalRef} />
		</section>
	);
}
