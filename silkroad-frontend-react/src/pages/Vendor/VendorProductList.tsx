import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import { products } from "@/types/data/product";

export default function VendorProductList() {


	return (
		<>
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