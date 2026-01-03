import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import ReviewItem from "@/components/molecules/ReviewItem";
import styles from "./ReviewPage.module.scss";
import { useVendorReviews } from "@/hooks/store/review";

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type DateRangeOption = "custom" | "week" | "month" | "quarter" | "year";

export default function ReviewPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [searchParams] = useSearchParams();
  const highlightReviewId = searchParams.get("highlight");
  const vendorIdNum = vendorId ? parseInt(vendorId, 10) : 0;

  const {
    data: reviews = [],
    isLoading,
    isError,
    error,
  } = useVendorReviews(vendorIdNum);

  const reviewRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});

  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [dateRangeType, setDateRangeType] = useState<DateRangeOption>("custom");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDatePreset = (type: DateRangeOption) => {
    setDateRangeType(type);
    if (type === "custom") return;

    const end = new Date();
    const start = new Date();

    switch (type) {
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setMonth(end.getMonth() - 1);
        break;
      case "quarter":
        start.setMonth(end.getMonth() - 3);
        break;
      case "year":
        start.setFullYear(end.getFullYear() - 1);
        break;
    }

    setEndDate(end.toISOString().split("T")[0]);
    setStartDate(start.toISOString().split("T")[0]);
  };

  // 滾動到高亮的評論
  useEffect(() => {
    if (highlightReviewId && reviews.length > 0) {
      const reviewId = parseInt(highlightReviewId, 10);
      const reviewElement = reviewRefs.current[reviewId];

      if (reviewElement) {
        // 延遲一下，確保 DOM 已渲染完成
        setTimeout(() => {
          reviewElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          // 添加高亮效果
          reviewElement.style.transition = "background-color 0.3s ease";
          reviewElement.style.backgroundColor = "#fff3cd";
          setTimeout(() => {
            reviewElement.style.backgroundColor = "";
          }, 2000);
        }, 300);
      }
    }
  }, [highlightReviewId, reviews]);

  const processedReviews = useMemo(() => {
    if (!reviews) return [];

    let result = [...reviews];

    if (searchTerm) {
      result = result.filter((r) =>
        r.order_id?.toString().includes(searchTerm)
      );
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
        case "newest":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [reviews, searchTerm, ratingFilter, startDate, endDate, sortOption]);

  if (isLoading)
    return <div className={styles.pageContainer}>載入評論中...</div>;

  if (isError) {
    console.error("Fetch Review Error:", error);
    return (
      <div className={styles.pageContainer}>
        讀取評論失敗，請稍後再試。
        <br />
        <small>(Vendor ID: {vendorIdNum})</small>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.title}>顧客評論專區</h1>

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

        <div className={styles.row}>
          <div className={styles.datePresets}>
            {[
              { label: "最近一週", val: "week" },
              { label: "最近一個月", val: "month" },
              { label: "最近一季", val: "quarter" },
              { label: "最近一年", val: "year" },
            ].map((btn) => (
              <button
                key={btn.val}
                className={`${styles.filterBtn} ${
                  dateRangeType === btn.val ? styles.active : ""
                }`}
                onClick={() => handleDatePreset(btn.val as DateRangeOption)}
              >
                {btn.label}
              </button>
            ))}
            <button
              className={`${styles.filterBtn} ${
                dateRangeType === "custom" ? styles.active : ""
              }`}
              onClick={() => {
                setDateRangeType("custom");
                setStartDate("");
                setEndDate("");
              }}
            >
              全部/自訂
            </button>
          </div>

          <div className={styles.dateInputs}>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setDateRangeType("custom");
              }}
              className={styles.dateInput}
            />
            <span>至</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setDateRangeType("custom");
              }}
              className={styles.dateInput}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.starFilters}>
            <span className={styles.label}>星級篩選：</span>
            <button
              className={`${styles.starBtn} ${
                ratingFilter === null ? styles.active : ""
              }`}
              onClick={() => setRatingFilter(null)}
            >
              全部
            </button>
            {[5, 4, 3, 2, 1].map((star) => (
              <button
                key={star}
                className={`${styles.starBtn} ${
                  ratingFilter === star ? styles.active : ""
                }`}
                onClick={() => setRatingFilter(star)}
              >
                {star} ★
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 評論列表區塊 */}
      <div className={styles.reviewGrid}>
        {processedReviews.length > 0 ? (
          processedReviews.map((review) => (
            <div
              key={review.review_id}
              ref={(el) => {
                reviewRefs.current[review.review_id] = el;
              }}
            >
              <ReviewItem
                reviewId={review.review_id}
                rating={review.rating}
                comment={review.content}
                orderId={review.order_id ?? undefined}
                date={review.created_at.replace("T", " ")}
                customerId={review.customer_id}
                vendorId={review.vendor_id}
                vendorPageId={vendorIdNum}
              />
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>沒有符合條件的評論</div>
        )}
      </div>
    </div>
  );
}
