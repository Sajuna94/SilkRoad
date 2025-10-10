import React from "react";
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
  return (
    <>
      <Link
        to={`/product/${id}`}
        state={{ id, name, price, img, description }}
        className="product-card"
      >
        <div className="image-container">
          <img src={img} alt={name} />
        </div>
        <h2>{name}</h2>
        <p>NT${price}</p>
      </Link>
    </>
  );
};

export default ProductCard;
