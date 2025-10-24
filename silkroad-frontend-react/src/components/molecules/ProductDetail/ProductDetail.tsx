import './ProductDetail.css';
import FadeInImage from "@/components/atoms/FadeInImage/FadeInImage";

interface ProductDetailProps {
  imgSrc: string;
  name: string;
  price: number;
  description: string;
  onAddToCart?: () => void;
}

export default function ProductDetail({
  imgSrc,
  name,
  price,
  description,
  onAddToCart,
}: ProductDetailProps) {
  return (
    <div className="detail-page">
      <FadeInImage src={imgSrc} alt={name} />

      <div className="detail-info">
        <h1>{name}</h1>
        <p className="price">NT ${price}</p>
        <p className="description">{description}</p>
        <button onClick={onAddToCart}>加入購物車</button>
      </div>
    </div>
  );
}
