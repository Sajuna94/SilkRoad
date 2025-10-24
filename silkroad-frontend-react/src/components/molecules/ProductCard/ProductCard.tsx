import React from "react";
import styles from "./ProductCard.module.css";
import FadeInImage from "@/components/atoms/FadeInImage/FadeInImage";

interface ProductCardProps {
	name: string;
	price: number;
	img: string;
	onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, img, onClick }) => (
	<article className={styles.card} onClick={onClick}>
		<header className={styles.imageArea}>
			<FadeInImage src={img} alt={name} />
		</header>
		<section className={styles.info}>
			<h2 className={styles.name}>{name}</h2>
			<p className={styles.price}>NT ${price}</p>
		</section>
	</article>
);

export default ProductCard;
