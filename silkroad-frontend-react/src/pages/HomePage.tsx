import { products } from "@/assets/data/drink";
import ReviewCard from "@/components/molecules/ReviewCard";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import { useInsertOrder, useOrder } from "@/hooks/order/order";

export default function HomePage() {
	const repeatedProducts = Array.from({ length: 5 }, () => products).flat();

	var order = useOrder();

	if (order.isSuccess) {
		console.log("Order", order);
	}



	return (
		<>
			<ProductGallery
				products={repeatedProducts}
				pageSize={10}
			/>

			<div style={{ marginTop: "40px" }}>
				<ReviewCard />
			</div>
		</>
	);
}
