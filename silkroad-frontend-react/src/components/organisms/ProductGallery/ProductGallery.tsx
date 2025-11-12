import { useRef } from "react";
import styles from "./ProductGallery.module.css";
import ProductCard from "@/components/molecules/ProductCard/ProductCard";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal/ProductModal";
import { InfiniteList } from "@/components/atoms/InfiniteList/InfiniteList";
import { type Product } from "@/types/store";

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
								img={'https://png.pngtree.com/thumb_back/fw800/background/20241025/pngtree-green-smoothie-with-broccoli-image_16378995.jpg'}
								onClick={() => modalRef.current?.open(product)}
							/>
						)}
					/>
				</div>
			</div>

			<ProductModal ref={modalRef} />
		</section>
	);
}
