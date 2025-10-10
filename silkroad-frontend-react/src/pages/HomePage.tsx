import "./HomePage.css";
import { drinks } from "../assets/drink/drinkData";
import ProductCard from "@components/ProductCard";
import ReviewCard from "@components/ReviewCard";

export default function HomePage() {
  return (
    <div style={{ padding: "20px" }}>
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "1.8rem",
          fontWeight: 600,
        }}
      >
        飲品列表
      </h1>

      <div className="product-grid">
        {drinks.map((p, index) => (
          <ProductCard
            id={index + 1}
            key={index}
            name={p.name}
            price={p.price}
            img={p.img}
            description={p.description}
          />
        ))}
      </div>

      <div style={{ marginTop: "40px" }}>
        <ReviewCard />
      </div>
    </div>
  );
}
