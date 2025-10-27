import React from "react";
import styles from "./ProductCard.module.css";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";

interface ProductCardProps {
	name: string;
	price: number;
	img: string;
	onClick?: () => void;
}

const ProductCard = React.memo(({ name, price, img, onClick }: ProductCardProps) => (
	<article className={styles.card} onClick={onClick}>
		<header className={styles.imageArea}>
			<FadeInImage fullSrc={img} />
		</header>
		<section className={styles.info}>
			<h2 className={styles.name}>{name}</h2>
			<p className={styles.price}>NT ${price}</p>
		</section>
	</article>
));

export default ProductCard;
