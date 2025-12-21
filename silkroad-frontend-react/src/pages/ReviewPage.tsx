import ReviewItem from "@/components/molecules/ReviewItem";
import styles from "./ReviewPage.module.scss";

// 模擬資料
const mockReviews = [
  {
    id: 1,
    rating: 5,
    comment: "送餐速度超快，飲料很好喝！",
    orderId: 1001,
    date: "2025-12-20",
  },
  {
    id: 2,
    rating: 4,
    comment: "包裝很完整，但冰塊稍微多了一點。",
    orderId: 1005,
    date: "2025-12-18",
  },
  { id: 3, rating: 3, comment: "", orderId: 1012, date: "2025-12-15" },
  {
    id: 4,
    rating: 4,
    comment: "包裝很完整，但冰塊稍微多了一點。",
    orderId: 1005,
    date: "2025-12-18",
  },
  {
    id: 5,
    rating: 4,
    comment: "包裝很完整，但冰塊稍微多了一點。",
    orderId: 1005,
    date: "2025-12-18",
  },
  {
    id: 6,
    rating: 4,
    comment: "包裝很完整，但冰塊稍微多了一點。",
    orderId: 1005,
    date: "2025-12-18",
  },
];

export default function ReviewPage() {
  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>顧客評論專區</h1>

      <div className={styles.reviewGrid}>
        {mockReviews.map((review) => (
          <ReviewItem
            key={review.id}
            reviewId={review.id}
            rating={review.rating}
            comment={review.comment}
            orderId={review.orderId}
            date={review.date}
          />
        ))}
      </div>
    </div>
  );
}
