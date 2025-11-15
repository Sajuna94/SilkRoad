import { useEffect, useRef, useState } from "react";
import styles from "./ProductGallery.module.css";
import ProductCard from "@/components/molecules/ProductCard/ProductCard";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal/ProductModal";
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
								img={product.url}
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

type InfiniteListProps<T> = {
	fullItems: T[]; // 全部資料
	renderItem: (item: T, index: number) => React.ReactNode;
	pageSize: number; // 每次載入幾筆，預設 6
};

export function InfiniteList<T>({
	fullItems,
	renderItem,
	pageSize,
}: InfiniteListProps<T>) {
	const [visibleItems, setVisibleItems] = useState<T[]>(fullItems.slice(0, pageSize));
	const [page, setPage] = useState(1);
	const loaderRef = useRef<HTMLDivElement | null>(null);

	const hasMore = visibleItems.length < fullItems.length;

	useEffect(() => {
		if (!hasMore) return;
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				const nextPage = page + 1;
				const nextItems = fullItems.slice(0, nextPage * pageSize);
				setVisibleItems(nextItems);
				setPage(nextPage);
			}
		});
		if (loaderRef.current) observer.observe(loaderRef.current);
		return () => observer.disconnect();
	}, [hasMore, page, fullItems]);

	return (
		<>
			{visibleItems.map((item, i) => renderItem(item, i))}
			{hasMore && <div ref={loaderRef} style={{ height: "1px" }} />}
		</>
	);
}
