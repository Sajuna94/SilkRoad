import { useState } from "react";
import StarRating from "../atoms/StarRating";

export default function ReviewInput() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      alert("請給予星級評價！");
      return;
    }
    console.log("送出評價:", { rating, comment });
    alert("評價已送出！");
    setRating(0);
    setComment("");
  };

  return (
    <div
      style={{
        background: "#fff",
        padding: "24px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
        maxWidth: "500px",
        margin: "0 auto",
      }}
    >
      <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
        商品評價
      </h3>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: "20px",
        }}
      >
        <StarRating
          initialRating={rating}
          onRatingChange={setRating}
          size={32}
        />
      </div>

      <textarea
        style={{
          width: "100%",
          minHeight: "100px",
          padding: "12px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          fontSize: "1rem",
          resize: "none",
          outline: "none",
          marginBottom: "16px",
        }}
        placeholder="寫下您的心得..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        style={{
          width: "100%",
          padding: "12px",
          background: "#fbbf24",
          color: "#000",
          border: "none",
          borderRadius: "8px",
          fontSize: "1rem",
          fontWeight: "bold",
          cursor: "pointer",
          transition: "background 0.2s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#f59e0b")}
        onMouseOut={(e) => (e.currentTarget.style.background = "#fbbf24")}
      >
        送出評價
      </button>
    </div>
  );
}
