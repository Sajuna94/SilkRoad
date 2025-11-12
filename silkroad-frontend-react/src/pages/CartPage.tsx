import { useNavigate } from "react-router-dom";
import "./CartPage.css";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal/ProductModal";
import { useRef } from "react";
import { products } from "@/assets/data/drink";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
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
		{
			name: "抹茶拿鐵",
			price: 70,
			sugar: "無糖",
			ice: "去冰",
			quantity: 1,
			note: "",
		},
		{
			name: "抹茶拿鐵",
			price: 70,
			sugar: "無糖",
			ice: "去冰",
			quantity: 1,
			note: "",
		},
		{
			name: "抹茶拿鐵",
			price: 70,
			sugar: "無糖",
			ice: "去冰",
			quantity: 1,
			note: "",
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

	const url = "https://png.pngtree.com/thumb_back/fw800/background/20241025/pngtree-green-smoothie-with-broccoli-image_16378995.jpg";

	return (
		<section className="container">
			<h2>購物車</h2>

			{cartItems.length === 0 ? (
				<p className="cart-empty">購物車是空的，快去逛逛吧！</p>
			) : (
				<>
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

					<div className="footer">
						<div className="total">
							NT${total}
						</div>

						<div className="buttons">
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
