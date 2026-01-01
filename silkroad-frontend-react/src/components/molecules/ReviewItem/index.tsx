import { Link } from "react-router-dom";
import StarRating from "../../atoms/StarRating";
import styles from "./ReviewItem.module.scss";

interface ReviewItemProps {
  reviewId: number;
  rating: number;
  comment: string;
  orderId: number;
  date: string;
}

export default function ReviewItem({
  rating,
  comment,
  orderId,
  date,
}: ReviewItemProps) {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <StarRating initialRating={rating} readonly size={20} />
      </div>

      <div className={styles.content}>
        {comment || "此用戶沒有填寫評論內容。"}
      </div>

      <div className={styles.footer}>
        <div className={styles.orderInfo}>
          訂單編號：
          <Link to={`/orders/${orderId}`}>#{orderId}</Link>
        </div>

        <div className={styles.date}>{date}</div>
      </div>
    </div>
  );
}
