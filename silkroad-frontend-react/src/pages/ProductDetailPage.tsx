import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./ProductDetailPage.css";
import { drinks } from "@/assets/data/drink";

export default function ProductDetailPage() {
	const { id } = useParams(); // 讀取網址 /product/:id
	const location = useLocation();
	const navigate = useNavigate();

	// 從 router state 或 drinkData 找商品
	const product =
		(location.state as any) ||
		drinks.find((_, index) => index + 1 === Number(id));

	if (!product) {
		return (
			<div style={{ textAlign: "center", marginTop: "3rem" }}>
				<p>找不到商品資料。</p>
				<button onClick={() => navigate("/")}>返回首頁</button>
			</div>
		);
	}

	return (
		<div className="detail-page">
			<div className="detail-image">
				<img src={product.img} alt={product.name} />
			</div>

			<div className="detail-info">
				<h1>{product.name}</h1>
				<p className="price">價格：NT${product.price}</p>
				<p className="description">{product.description}</p>
				<button>加入購物車</button>
			</div>
		</div>
	);
}
