import { useState } from "react";
import StarRating from "../../atoms/StarRating";
import styles from "./ReviewInput.module.scss";
// 1. 引入 API Hook
import { usePostReview } from "@/hooks/store/review";

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

  // 2. 使用 Mutation Hook
  // isPending 可以用來讓按鈕變成 loading 狀態，防止重複點擊
  const { mutate: postReview, isPending } = usePostReview();

  const handleSubmit = () => {
    // 基礎驗證
    if (!orderId) {
      alert("訂單 ID 錯誤");
      return;
    }
    if (rating === 0) {
      alert("請給予星級評價！");
      return;
    }

    // 3. 呼叫 API
    postReview(
      {
        order_id: orderId,
        rating: rating,
        review_content: comment,
      },
      {
        onSuccess: () => {
          alert("評價已送出！");
          setRating(0);
          setComment("");

          // 4. 成功後呼叫 callback (關閉 Modal)
          if (onSubmitSuccess) {
            onSubmitSuccess();
          }
        },
        onError: (error: any) => {
          const msg = error.response?.data?.message || "評價提交失敗";
          alert(msg);
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>
        商品評價 {orderId && `(訂單 #${orderId})`}
      </h3>

      <div className={styles.ratingWrapper}>
        <StarRating
          initialRating={rating}
          onRatingChange={(newRating) => setRating(newRating)}
          size={32}
          // 可以在送出中時鎖定評分 (可選)
          // disabled={isPending}
        />
      </div>

      <textarea
        className={styles.textarea}
        placeholder="寫下您的心得..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isPending} // 送出中時禁止編輯
      />

      <button
        className={styles.submitBtn}
        onClick={handleSubmit}
        disabled={isPending} // 送出中時禁止點擊
        style={{
          opacity: isPending ? 0.7 : 1,
          cursor: isPending ? "not-allowed" : "pointer",
        }}
      >
        {isPending ? "送出中..." : "送出評價"}
      </button>
    </div>
  );
}
