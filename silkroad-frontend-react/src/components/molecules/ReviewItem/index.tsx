import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/vendor/dashboard?orderId=${orderId}#3`);
  };
  return (
    <div className={styles.card} onClick={handleClick} style={{ cursor: "pointer" }}>
      <div className={styles.header}>
        <StarRating initialRating={rating} readonly size={20} />
      </div>

      <div className={styles.content}>
        {comment || "此用戶沒有填寫評論內容。"}
      </div>

      <div className={styles.footer}>
        <div className={styles.orderInfo}>
          訂單編號：#{orderId}
          {/* <Link to={`/orders/${orderId}`}>#{orderId}</Link> */}
        </div>

        <div className={styles.date}>{date}</div>
      </div>
    </div>
  );
}
