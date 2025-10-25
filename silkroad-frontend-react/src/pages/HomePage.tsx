import { products } from "@/assets/data/drink";
import ReviewCard from "@/components/ReviewCard";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";

export default function HomePage() {
	const repeatedProducts = Array.from({ length: 5 }, () => products).flat();

	return (
		<>
			<ProductGallery
				products={repeatedProducts}
				pageSize={10}
				onAddToCart={(product) => console.log("加入購物車", product.id)}
			/>

			<div style={{ marginTop: "40px" }}>
				<ReviewCard />
			</div>
		</>
	);
}
