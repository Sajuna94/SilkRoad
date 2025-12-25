import { useRef } from "react";
import styles from "./ProductGallery.module.scss";
import ProductCard from "@/components/molecules/ProductCard";
import {
    ProductModal,
    type ProductModalRef,
} from "@/components/molecules/ProductModal";
import { type Product } from "@/types/store";
import { InfiniteList } from "@/components/atoms/InfiniteList";
import { useAddToCart } from "@/hooks/order/cart";
import { useCurrentUser } from "@/hooks/auth/user";

interface ProductGalleryProps {
    products: Product[];
    pageSize: number;
}
interface FormState {
    size: string;
    ice: string;
    sugar: string;
    quantity: number;
}

export default function ProductGallery({
    products,
    pageSize,
}: ProductGalleryProps) {
    const modalRef = useRef<ProductModalRef>(null);
    const addToCart = useAddToCart();
    const currentUserQuery = useCurrentUser();

    const handleSubmit = async (product: Product, form: FormState) => {
        const res = await addToCart.mutateAsync({
            vendor_id: product.vendor_id,
            product_id: product.id,
            quantity: form.quantity,
            selected_ice: form.ice,
            selected_size: form.size,
            selected_sugar: form.sugar,
        });

        console.log("addToCart response:", res);
    };

    return (
        <section>
            <ProductModal
                ref={modalRef}
                submitText={currentUserQuery.isFetched ? "加入購物車" : "請先登入"}
                onSubmit={currentUserQuery.isFetched ? handleSubmit : async () => { modalRef.current?.close() }}
            />

            <div className={styles.container}>
                <div className={styles.gallery}>
                    <InfiniteList<Product>
                        fullItems={products}
                        pageSize={pageSize}
                        renderItem={(product, index) => (
                            <ProductCard
                                key={index}
                                name={product.name}
                                price={product.price}
                                img={product.image_url}
                                onClick={() => modalRef.current?.open(product)}
                            />
                        )}
                    />
                </div>
            </div>
        </section>
    );
}
