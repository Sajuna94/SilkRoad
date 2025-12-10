import { useRef } from "react";
import styles from "./ProductGallery.module.scss";
import ProductCard from "@/components/molecules/ProductCard";
import {
  ProductModal,
  type ProductModalRef,
} from "@/components/molecules/ProductModal";
import { type Product } from "@/types/store";
import { InfiniteList } from "@/components/atoms/InfiniteList";

interface ProductGalleryProps {
  products: Product[];
  pageSize: number;
}

export default function ProductGallery({
  products,
  pageSize,
}: ProductGalleryProps) {
  const modalRef = useRef<ProductModalRef>(null);

  return (
    <section>
      <ProductModal
        ref={modalRef}
        submitText="加入購物車"
        onSubmit={async () => {
          // 模擬等待 2 秒
          await new Promise((resolve) => setTimeout(resolve, 2000));

          console.log(modalRef.current?.getForm());
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
                img={product.url}
                onClick={() => modalRef.current?.open(product)}
              />
            )}
          />
        </div>
      </div>
    </section>
  );
}
