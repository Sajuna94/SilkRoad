import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";

interface ProductCardProps {
	id: number;
	name: string;
	price: number;
	img: string;
	description: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
	id,
	name,
	price,
	img,
	description,
}) => {
	const [loaded, setLoaded] = useState(false);

	return (
		<Link
			to={`/product/${id}`}
			state={{ id, name, price, img, description }}
			className="product-card"
		>
			<div className="image-container">
				<img
					src={img}
					alt={name}
					loading="lazy"
					onLoad={() => setLoaded(true)}
					className={loaded ? "fade-in" : ""}
					style={{ visibility: loaded ? "visible" : "hidden" }}
				/>
			</div>
			<h2>{name}</h2>
			<p>NT ${price}</p>
		</Link>
	);
};

export default ProductCard;
