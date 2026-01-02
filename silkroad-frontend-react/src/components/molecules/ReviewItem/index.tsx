import { useNavigate } from "react-router-dom";
import { useCurrentUser } from "@/hooks/auth/user";
import { useUserOrders } from "@/hooks/order/order";
import StarRating from "../../atoms/StarRating";
import styles from "./ReviewItem.module.scss";

interface ReviewItemProps {
  reviewId: number;
  rating: number;
  comment: string;
  orderId?: number;
  date: string;
  customerId?: number;
  vendorId?: number;
  vendorPageId?: number;
}

export default function ReviewItem({
  rating,
  comment,
  orderId,
  date,
  customerId,
  vendorId,
  vendorPageId,
}: ReviewItemProps) {
  const navigate = useNavigate();
  const { data: currentUser } = useCurrentUser();

  const { data: myOrders } = useUserOrders(currentUser?.id);

  const canNavigateForCustomer = (() => {
    if (currentUser?.role !== "customer" || !currentUser?.id) return false;
    if (customerId != null && currentUser.id === customerId) return true;
    if (orderId && myOrders && myOrders.some((o: any) => o.order_id === orderId)) return true;
    return false;
  })();

  const canNavigateForVendor = (() => {
    if (currentUser?.role !== "vendor" || !currentUser?.id) return false;
    if (vendorId && currentUser.id === vendorId) return true;
    if (vendorPageId && currentUser.id === vendorPageId) return true;
    return false;
  })();

  const shouldNavigate = canNavigateForCustomer || canNavigateForVendor;

  const handleNavigate = () => {
    if (!orderId) return;

    if (!shouldNavigate) {
      if (currentUser?.role === "vendor") {
        alert("此評論不屬於您的商家，無法前往後台訂單。");
      } else {
        alert("此評論非您本人所留，無法查看該訂單。");
      }
      return;
    }

    if (currentUser?.role === "vendor") {
      navigate(`/vendor/dashboard?orderId=${orderId}#3`);
    } else {
      navigate(`/orders?selected=${orderId}`);
    }
  };
  return (
    <div
      className={styles.card}
      onClick={() => {
        handleNavigate();
      }}
      style={{ cursor: "pointer" }}
    >
      <div className={styles.header}>
        <StarRating initialRating={rating} readonly size={20} />
      </div>

      <div className={styles.content}>
        {comment || "此用戶沒有填寫評論內容。"}
      </div>

      <div className={styles.footer}>
        <div className={styles.orderInfo}>
          訂單編號：
          {shouldNavigate ? (
            <span
              style={{ color: "var(--link-color, #2563eb)", textDecoration: "underline" }}
              title={currentUser?.role === "vendor" ? "前往後台訂單" : "查看我的訂單"}
            >
              #{orderId}
            </span>
          ) : (
            <span>#{orderId}</span>
          )}
        </div>

        <div className={styles.date}>{date}</div>
      </div>
    </div>
  );
}
