import { useState } from "react";
import StarRating from "../../atoms/StarRating";
import styles from "./ReviewInput.module.scss";

interface ReviewInputProps {
  onSubmitSuccess?: () => void;
  orderId?: number | null;
}

export default function ReviewInput({
  onSubmitSuccess,
  orderId,
}: ReviewInputProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating === 0) {
      alert("請給予星級評價！");
      return;
    }
    console.log("送出評價:", { rating, comment, orderId });
    alert("評價已送出！");
    setRating(0);
    setComment("");

    if (onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        商品評價 {orderId && `(訂單 #${orderId})`}
      </h3>

      <div className={styles.ratingWrapper}>
        <StarRating
          initialRating={rating}
          onRatingChange={setRating}
          size={32}
        />
      </div>

      <textarea
        className={styles.textarea}
        placeholder="寫下您的心得..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button className={styles.submitBtn} onClick={handleSubmit}>
        送出評價
      </button>
    </div>
  );
}
