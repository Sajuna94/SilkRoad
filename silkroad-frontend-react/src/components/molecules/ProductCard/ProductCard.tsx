import React from "react";
import "./ProductCard.css";
import FadeInImage from "@/components/atoms/FadeInImage/FadeInImage"; // <-- 新組件

interface ProductCardProps {
	name: string;
	price: number;
	img: string;
	onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ name, price, img, onClick }) => {
	return (
		<div className="product-card" onClick={onClick}>
			<div style={{ height: '200px' }}>
				<FadeInImage src={img} alt={name} />
			</div>
			<h2>{name}</h2>
			<p>NT ${price}</p>
		</div>
	);
};

export default ProductCard;
