import { FadeInImage } from "@/components/atoms/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import { products } from "@/types/data/product";
import { Link } from "react-router-dom";
import ReviewCard from "@/components/molecules/ReviewCard";

export default function ProductList() {
  return (
    <>
      <Link to={"/vendor/dashboard"}> dashboard </Link>
      <ProductGallery products={products} pageSize={10} />
      <VendorHeaderBarImage />
      <div style={{ marginTop: "40px" }}>
        <ReviewCard />
      </div>
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
