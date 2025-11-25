import { products } from "@/types/data/product";
import ReviewCard from "@/components/molecules/ReviewCard";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";

export default function Home() {
    const repeatedProducts = Array.from({ length: 5 }, () => products).flat();

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
