import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import { products } from "@/types/data/product";
import { Link } from "react-router-dom";

export default function ProductList() {
	return (
		<>
			<Link to={"/vendor/dashboard"} > dashboard </Link>
			<ProductGallery
				products={products.slice(0, 5)}
				pageSize={6}
			/>
			<VendorHeaderBarImage />
		</>
	);
}

function VendorHeaderBarImage() {
	return (
		<>
			<FadeInImage fullSrc="" />
		</>
	)
}