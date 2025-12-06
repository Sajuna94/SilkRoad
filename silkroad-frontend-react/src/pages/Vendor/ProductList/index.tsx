import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import { products } from "@/types/data/product";
import { Link } from "react-router-dom";

export default function ProductList() {
<<<<<<< HEAD
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
=======
  return (
    <>
      <Link to={"/vendor/dashboard"}> dashboard </Link>
      <ProductGallery products={products.slice(0, 5)} pageSize={6} />
      <VendorHeaderBarImage />
    </>
  );
}

function VendorHeaderBarImage() {
  return (
    <>
      <FadeInImage fullSrc="" />
    </>
  );
}
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a
