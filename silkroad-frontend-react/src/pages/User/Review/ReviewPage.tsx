import { useState, useMemo } from "react";
import { useParams } from "react-router-dom"; // 1. 記得引入這行
import ReviewItem from "@/components/molecules/ReviewItem";
import styles from "./ReviewPage.module.scss";
import { useVendorReviews } from "@/hooks/store/review";

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type DateRangeOption = "custom" | "week" | "month" | "quarter" | "year";

export default function ReviewPage() {
  // 2. 抓取網址上的 ID
  const { vendorId } = useParams<{ vendorId: string }>();
  const vendorIdNum = vendorId ? parseInt(vendorId, 10) : 0;

  // 3. 傳入正確的 ID
  const { data: reviews = [], isLoading, isError, error } = useVendorReviews(vendorIdNum);

  // ... (其餘 state 保持不變)
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeType, setDateRangeType] = useState<DateRangeOption>("custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ... (handleDatePreset 保持不變)
  const handleDatePreset = (type: DateRangeOption) => {
    setDateRangeType(type);
    if (type === "custom") return;
    const end = new Date();
    const start = new Date();
    switch (type) {
      case "week": start.setDate(end.getDate() - 7); break;
      case "month": start.setMonth(end.getMonth() - 1); break;
      case "quarter": start.setMonth(end.getMonth() - 3); break;
      case "year": start.setFullYear(end.getFullYear() - 1); break;
    }
    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  };

  // ... (processedReviews 保持不變)
  const processedReviews = useMemo(() => {
    if (!reviews) return [];
    let result = [...reviews];

    if (searchTerm) {
      result = result.filter((r) => r.order_id?.toString().includes(searchTerm));
    }
    if (ratingFilter !== null) {
      result = result.filter((r) => r.rating === ratingFilter);
    }
    if (startDate) {
      result = result.filter((r) => r.created_at.split("T")[0] >= startDate);
    }
    if (endDate) {
      result = result.filter((r) => r.created_at.split("T")[0] <= endDate);
    }

    result.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      switch (sortOption) {
        case "newest": return dateB - dateA;
        case "oldest": return dateA - dateB;
        case "highest": return b.rating - a.rating;
        case "lowest": return a.rating - b.rating;
        default: return 0;
      }
    });
    return result;
  }, [reviews, searchTerm, ratingFilter, startDate, endDate, sortOption]);

  if (isLoading) return <div className={styles.pageContainer}>載入評論中...</div>;
  
  // 顯示詳細錯誤訊息方便除錯
  if (isError) {
    console.error(error); // 在 F12 Console 顯示錯誤細節
    return <div className={styles.pageContainer}>讀取評論失敗，請確認後端資料庫已更新。</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>顧客評論專區</h1>
      {/* ... (下方的 JSX 保持不變) ... */}
      <div className={styles.controls}>
        <div className={styles.row}>
          <input
            type="text"
            placeholder="搜尋訂單編號..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className={styles.selectInput}
          >
            <option value="newest">日期：由新到舊</option>
            <option value="oldest">日期：由舊到新</option>
            <option value="highest">評分：由高到低</option>
            <option value="lowest">評分：由低到高</option>
          </select>
        </div>
        {/* ... 日期與星級篩選器 ... */}
        <div className={styles.row}>
             {/* 這裡省略，保持你原本的代碼即可 */}
             <div className={styles.datePresets}>
                {/* ...略... */}
             </div>
             <div className={styles.dateInputs}>
                {/* ...略... */}
             </div>
        </div>
        <div className={styles.row}>
             <div className={styles.starFilters}>
                 {/* ...略... */}
                 <button onClick={() => setRatingFilter(null)}>全部</button>
             </div>
        </div>
      </div>

      <div className={styles.reviewGrid}>
        {processedReviews.length > 0 ? (
          processedReviews.map((review) => (
            <ReviewItem
              key={review.review_id}
              reviewId={review.review_id}
              rating={review.rating}
              comment={review.content}
              orderId={review.order_id || 0}
              date={review.created_at}
            />
          ))
        ) : (
          <div className={styles.emptyState}>沒有符合條件的評論</div>
        )}
      </div>
    </div>
  );
}