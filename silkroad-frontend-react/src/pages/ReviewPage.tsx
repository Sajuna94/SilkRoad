import { useState, useMemo } from "react";
import ReviewItem from "@/components/molecules/ReviewItem";
import styles from "./ReviewPage.module.scss";

// 模擬資料
const mockReviews = [
  {
    id: 1,
    rating: 5,
    comment: "我真的很好喝耶！推薦給大家～",
    orderId: 1001,
    date: "2025-12-20",
  },
  {
    id: 2,
    rating: 4,
    comment: "最喜歡帆帆",
    orderId: 1005,
    date: "2025-12-18",
  },
  { id: 3, rating: 3, comment: "", orderId: 1012, date: "2025-12-15" },
  {
    id: 4,
    rating: 1,
    comment: "喔買尬，這是我喝過最難喝的飲料，六星好評！",
    orderId: 1020,
    date: "2025-11-01",
  },
  {
    id: 5,
    rating: 5,
    comment: "cliu 可以再噁心一點！",
    orderId: 1033,
    date: "2025-10-15",
  },
  {
    id: 6,
    rating: 1,
    comment: "等到天荒地老",
    orderId: 1045,
    date: "2024-12-18",
  },
];

type SortOption = "newest" | "oldest" | "highest" | "lowest";
type DateRangeOption = "custom" | "week" | "month" | "quarter" | "year";

export default function ReviewPage() {
  const [searchTerm, setSearchTerm] = useState(""); // 訂單編號搜尋
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

  const processedReviews = useMemo(() => {
    let result = [...mockReviews];

    if (searchTerm) {
      result = result.filter((r) => r.orderId.toString().includes(searchTerm));
    }

    if (ratingFilter !== null) {
      result = result.filter((r) => r.rating === ratingFilter);
    }

    if (startDate) {
      result = result.filter((r) => r.date >= startDate);
    }
    if (endDate) {
      result = result.filter((r) => r.date <= endDate);
    }

    result.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "oldest":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "highest":
          return b.rating - a.rating;
        case "lowest":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

    return result;
  }, [searchTerm, ratingFilter, startDate, endDate, sortOption]);

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

      <div className={styles.reviewGrid}>
        {processedReviews.length > 0 ? (
          processedReviews.map((review) => (
            <ReviewItem
              key={review.id}
              reviewId={review.id}
              rating={review.rating}
              comment={review.comment}
              orderId={review.orderId}
              date={review.date}
            />
          ))
        ) : (
          <div className={styles.emptyState}>沒有符合條件的評論</div>
        )}
      </div>
    </div>
  );
}
