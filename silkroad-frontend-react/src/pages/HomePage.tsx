import "./HomePage.css";
import { drinks } from "@/assets/data/drink";
import ProductCard from "@components/ProductCard";
import ReviewCard from "@components/ReviewCard";
import { useState } from "react";

export default function HomePage() {
	const [visibleCount, setVisibleCount] = useState(10);


	return (
		<div style={{ padding: "20px" }}>
			<div>aaa</div>
			<h1
				style={{
					textAlign: "center",
					marginBottom: "20px",
					fontSize: "1.8rem",
					fontWeight: 600,
				}}
			>
				飲品列表
			</h1>

			<div className="product-grid">
				{drinks.slice(0, visibleCount).map((p, index) => (
					<ProductCard
						id={index + 1}
						key={index}
						name={p.name}
						price={p.price}
						img={`/SilkRoad/images/drink/compressed/${p.img}-${200}-40.webp`}
						description={p.description}
					/>
				))}
			</div>

			{visibleCount < drinks.length && (
				<button onClick={() => setVisibleCount(c => c + 10)}>載入更多</button>
			)}

			<div style={{ marginTop: "40px" }}>
				<ReviewCard />
			</div>
		</div>
	);
}
