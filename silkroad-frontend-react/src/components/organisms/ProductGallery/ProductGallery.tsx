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

export default function ProductGallery({
    products,
    pageSize,
}: ProductGalleryProps) {
    const modalRef = useRef<ProductModalRef>(null);
    const addToCart = useAddToCart();
    const { data: user } = useCurrentUser();

    return (
        <section>
            <ProductModal
                ref={modalRef}
                submitText="加入購物車"
                onSubmit={async (product, form) => {
                    // Backend switcher handles both logged-in and guest users
                    await addToCart.mutateAsync({
                        customer_id: user?.id, // Optional - only passed when logged in
                        vendor_id: product.vendor_id,
                        product_id: product.id,
                        quantity: form.quantity,
                        selected_sugar: form.sugar,
                        selected_ice: form.ice,
                        selected_size: form.size,
                    });
                }}
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
