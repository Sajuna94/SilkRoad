import "./HomePage.css";
import { drinks } from "@/assets/data/drink";
import ProductCard from "@/components/ProductCard";
import ReviewCard from "@/components/ReviewCard";
import { useState, useEffect, useRef } from "react";

export default function HomePage() {
	const repeatedDrinks = Array.from({ length: 5 }, () => drinks).flat();

	const [visibleCount, setVisibleCount] = useState(10);
	const [srcsetMap, setSrcsetMap] = useState<Record<string, string[]>>({});
	const loaderRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		fetch("/SilkRoad/images/compressed/srcset.json")
			.then(res => res.json())
			.then(data => setSrcsetMap(data));
	}, []);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && visibleCount < drinks.length) {
					setVisibleCount((prev) => prev + 10);
				}
			},
			{ threshold: 0.5 }
		);

		if (loaderRef.current) {
			observer.observe(loaderRef.current);
		}

		return () => {
			if (loaderRef.current) {
				observer.unobserve(loaderRef.current);
			}
		};
	}, [visibleCount]);

	return (
		<div style={{ padding: "20px" }}>
			<h1 className="list-title">飲品列表</h1>

			<div className="product-container">
				<div className="product-grid">
					{repeatedDrinks.slice(0, visibleCount).map((p, index) => (
						<ProductCard
							id={p.id}
							key={index}
							name={p.name}
							price={p.price}
							img={`/SilkRoad/images/${srcsetMap[`drink/${p.img}.jpg`]?.[0]}`}
							description={p.description}
						/>
					))}
				</div>
				{visibleCount < repeatedDrinks.length && (
					<div ref={loaderRef} style={{ height: "60px", marginTop: "1.5rem" }}>
						<p style={{ textAlign: "center" }}>載入中...</p>
					</div>
				)}
			</div>

			<div style={{ marginTop: "40px" }}>
				<ReviewCard />
			</div>
		</div>
	);
}
