import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import { products } from "@/types/data/product";
import { Link } from "react-router-dom";

<<<<<<< HEAD:silkroad-frontend-react/src/pages/Vendor/ProductList/index.tsx
export default function VendorProductList() {
=======
export default function ProductList() {


>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374:silkroad-frontend-react/src/pages/Vendor/VendorProductList.tsx
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