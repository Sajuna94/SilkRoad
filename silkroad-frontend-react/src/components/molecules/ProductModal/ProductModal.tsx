import styles from "./ProductModal.module.css";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";

interface ProductModalProps {
	previewSrc?: string;
	fullSrc: string;
	name: string;
	price: number;
	description: string;
	onAddToCart?: () => void;
}

export default function ProductModal({
	previewSrc,
	fullSrc,
	name,
	price,
	description,
	onAddToCart,
}: ProductModalProps) {
	return (
		<section className={styles.modal}>
			<div className={styles.imageArea}>
				<FadeInImage previewSrc={previewSrc} fullSrc={fullSrc} alt={name}/>
			</div>

			<div className={styles.content}>
				<h1 className={styles.name}>{name}</h1>
				<p className={styles.price}>NT ${price}</p>
				<p className={styles.description}>{description}</p>
				<button className={styles.button} onClick={onAddToCart}>
					加入購物車
				</button>
			</div>
		</section>
	);
}
