import { useState } from "react";
import styles from "./ProductGallery.module.css";
import ProductCard from "@/components/molecules/ProductCard/ProductCard";
import ProductModal from "@/components/molecules/ProductModal/ProductModal";
import { InfiniteList } from "@/components/atoms/InfiniteList/InfiniteList";
import { type Product } from "@/types/store";
import { useSrcsetMap } from "@/hooks/useSrcsetMap";

interface ProductGalleryProps {
	products: Product[];
	onAddToCart?: (product: Product) => void;
}

export default function ProductGallery({
	products,
	onAddToCart,
}: ProductGalleryProps) {
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
	const srcsetMap = useSrcsetMap();

	return (
		<section>
			<div className={styles.container}>
				<div className={styles.gallery}>
					<InfiniteList<Product>
						fullItems={products}
						pageSize={5}
						renderItem={(product, index) => (
							<ProductCard
								key={index}
								name={product.name}
								price={product.price}
								img={`/SilkRoad/images/${srcsetMap[`drink/${product.img}.jpg`]?.[0]}`}
								onClick={() => setSelectedProduct(product)}
							/>
						)}
					/>
				</div>
			</div>

			{selectedProduct && (
				<div className={styles.modalOverlay} onClick={() => setSelectedProduct(null)}>
					<div onClick={(e) => e.stopPropagation()}>
						<ProductModal
							imgSrc={`/SilkRoad/images/drink/${selectedProduct.img}.jpg`}
							name={selectedProduct.name}
							price={selectedProduct.price}
							description={selectedProduct.description}
							onAddToCart={() => {
								onAddToCart?.(selectedProduct);
								setSelectedProduct(null);
							}}
						/>
					</div>
				</div>
			)}
		</section>
	);
}
