import "./HomePage.css";
import { drinks } from "@/assets/data/drink";
import ProductCard from "@/components/molecules/ProductCard/ProductCard";
import ReviewCard from "@/components/ReviewCard";
import { useState, useEffect, useRef } from "react";
import ProductDetail from "@/components/molecules/ProductDetail/ProductDetail";

export default function HomePage() {
	const repeatedDrinks = Array.from({ length: 5 }, () => drinks).flat();

	const [visibleCount, setVisibleCount] = useState(10);
	const [srcsetMap, setSrcsetMap] = useState<Record<string, string[]>>({});
	const [selectedProduct, setSelectedProduct] = useState<typeof drinks[0] | null>(null);
	const loaderRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		fetch("/SilkRoad/images/compressed/srcset.json")
			.then(res => res.json())
			.then(data => setSrcsetMap(data));
	}, []);

	useEffect(() => {
		const loader = loaderRef.current;
		if (!loader) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && visibleCount < repeatedDrinks.length) {
					setVisibleCount((prev) => prev + 10);
				}
			},
			{
				threshold: 0,
				rootMargin: "100px",
			}
		);

		observer.observe(loader);

		return () => {
			observer.unobserve(loader);
		};
	}, [visibleCount, repeatedDrinks.length]);

	return (
		<div style={{ padding: "20px" }}>
			<h1 className="list-title">飲品列表</h1>

			<div className="product-container">
				<div className="product-grid">
					{repeatedDrinks.slice(0, visibleCount).map((p, index) => (
						<ProductCard
							key={index}
							name={p.name}
							price={p.price}
							img={`/SilkRoad/images/${srcsetMap[`drink/${p.img}.jpg`]?.[0]}`}
							onClick={() => setSelectedProduct(p)} // 點擊打開 modal
						/>
					))}
				</div>

				{visibleCount < repeatedDrinks.length && (
					<div
						ref={loaderRef}
						style={{
							height: "100px",
							marginTop: "2rem",
							textAlign: "center",
							background: "#f0f0f0",
							border: "1px dashed #ccc",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
						}}
					>
						<p>載入中...</p>
					</div>
				)}
			</div>

			<div style={{ marginTop: "40px" }}>
				<ReviewCard />
			</div>

			{/* Modal */}
			{selectedProduct && (
				<div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
					<div className="modal-content" onClick={e => e.stopPropagation()}>
						<ProductDetail
							imgSrc={`/SilkRoad/images/drink/${selectedProduct.img}.jpg`}
							name={selectedProduct.name}
							price={selectedProduct.price}
							description={selectedProduct.description}
							onAddToCart={() => console.log("加入購物車", selectedProduct.id)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
