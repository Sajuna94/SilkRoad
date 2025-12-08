import { useState, useMemo } from "react";
import styles from "./DiscountManagement.module.scss";
import PostDiscount, { type DiscountForm } from "./PostDiscount";

const MOCK_DISCOUNTS: DiscountForm[] = [
  {
    id: "1",
    code: "WELCOME50",
    start_date: "2025-01-01",
    expiry_date: "2025-12-31",
    type: "FIXED",
    value: 50,
    min_purchase: "100",
    max_discount: "",
    membership_limit: "ALL",
  },
  {
    id: "2",
    code: "VIP88",
    start_date: "2025-06-01",
    expiry_date: "2025-06-30",
    type: "PERCENTAGE",
    value: 12,
    min_purchase: "500",
    max_discount: "100",
    membership_limit: "GOLD",
  },
  {
    id: "3",
    code: "FUTURE2026",
    start_date: "2026-01-01",
    expiry_date: "2026-02-01",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "",
    max_discount: "",
    membership_limit: "ALL",
  },
  {
    id: "4",
    code: "OLD2023",
    start_date: "2023-01-01",
    expiry_date: "2023-12-31",
    type: "FIXED",
    value: 100,
    min_purchase: "",
    max_discount: "",
    membership_limit: "ALL",
  },
];

type TabStatus = "ALL" | "ACTIVE" | "SCHEDULED" | "EXPIRED";

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<DiscountForm[]>(MOCK_DISCOUNTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscountForm | null>(null);

  // 狀態管理：Tab 與 篩選器
  const [currentTab, setCurrentTab] = useState<TabStatus>("ALL");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PERCENTAGE" | "FIXED">(
    "ALL"
  );
  const [filterMembership, setFilterMembership] = useState<string>("ALL");

  const today = new Date().toISOString().split("T")[0];

  // --- 核心邏輯：資料處理 (篩選 + 分類) ---
  const processedData = useMemo(() => {
    // 1. 先進行「屬性篩選」
    let filtered = discounts.filter((item) => {
      // 搜尋字串 (比對 Code)
      const matchText = item.code
        .toLowerCase()
        .includes(searchText.toLowerCase());
      // 類型篩選
      const matchType = filterType === "ALL" || item.type === filterType;
      // 會員篩選
      const matchMember =
        filterMembership === "ALL" ||
        item.membership_limit === filterMembership;

      return matchText && matchType && matchMember;
    });

    // 2. 標記狀態並進行「Tab 分類」
    const dataWithStatus = filtered.map((d) => {
      let status: TabStatus = "ACTIVE";
      if (d.expiry_date && today > d.expiry_date) status = "EXPIRED";
      else if (today < d.start_date) status = "SCHEDULED";
      return { ...d, status };
    });

    // 3. 根據 Tab 回傳結果
    if (currentTab === "ALL") return dataWithStatus;
    return dataWithStatus.filter((d) => d.status === currentTab);
  }, [discounts, searchText, filterType, filterMembership, currentTab, today]);

  // 計算各個 Tab 的數量 (用於顯示在按鈕上的數字)
  const counts = useMemo(() => {
    const all = discounts.length;
    let active = 0,
      scheduled = 0,
      expired = 0;
    discounts.forEach((d) => {
      if (d.expiry_date && today > d.expiry_date) expired++;
      else if (today < d.start_date) scheduled++;
      else active++;
    });
    return { ALL: all, ACTIVE: active, SCHEDULED: scheduled, EXPIRED: expired };
  }, [discounts, today]);

  // CRUD 操作
  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  const handleEdit = (item: DiscountForm) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };
  const handleDelete = (id: string) => {
    if (window.confirm("確定刪除此活動？"))
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
  };
  const handleSubmit = (formData: DiscountForm) => {
    if (editingItem) {
      setDiscounts((prev) =>
        prev.map((d) =>
          d.id === editingItem.id ? { ...formData, id: d.id } : d
        )
      );
    } else {
      setDiscounts((prev) => [
        { ...formData, id: Date.now().toString() },
        ...prev,
      ]);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1>折扣管理中心</h1>
          <p>管理您的促銷活動與優惠代碼</p>
        </div>
        <button className={styles.createBtn} onClick={handleCreate}>
          + 新增折扣
        </button>
      </header>

      {/* 狀態 Tab 切換區 */}
      <nav className={styles.tabs}>
        {[
          { id: "ALL", label: "所有活動", colorClass: styles.tabAll },
          { id: "ACTIVE", label: "正在進行", colorClass: styles.tabActive },
          {
            id: "SCHEDULED",
            label: "即將開始",
            colorClass: styles.tabScheduled,
          },
          { id: "EXPIRED", label: "已結束", colorClass: styles.tabExpired },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id as TabStatus)}
            className={`${styles.tabBtn} ${tab.colorClass} ${
              currentTab === tab.id ? styles.active : ""
            }`}
          >
            <span className={styles.tabLabel}>{tab.label}</span>
            <span className={styles.tabCount}>
              {counts[tab.id as keyof typeof counts]}
            </span>
          </button>
        ))}
      </nav>

      {/* 篩選工具列 */}
      <section className={styles.filterBar}>
        <div className={styles.searchGroup}>
          <input
            type="text"
            placeholder="搜尋折扣碼 (Code)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>
        <div className={styles.selectGroup}>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
          >
            <option value="ALL">全部類型</option>
            <option value="PERCENTAGE">% 折扣</option>
            <option value="FIXED">$ 定額</option>
          </select>
          <select
            value={filterMembership}
            onChange={(e) => setFilterMembership(e.target.value)}
          >
            <option value="ALL">全部會員等級</option>
            <option value="BRONZE">銅牌以上</option>
            <option value="SILVER">銀牌以上</option>
            <option value="GOLD">金牌以上</option>
          </select>
        </div>
      </section>

      {/* 列表顯示區 */}
      <div className={styles.grid}>
        {processedData.length === 0 ? (
          <div className={styles.emptyState}>沒有符合條件的資料</div>
        ) : (
          processedData.map((item) => (
            <div
              key={item.id}
              className={`${styles.card} ${styles[item.status]}`}
            >
              <div className={styles.cardHeader}>
                <span className={styles.code}>{item.code}</span>
                <span className={styles.badge}>
                  {item.type === "PERCENTAGE"
                    ? `-${item.value}%`
                    : `-$${item.value}`}
                </span>
              </div>
              <div className={styles.cardBody}>
                <p>
                  <strong>期限：</strong> {item.start_date} ~{" "}
                  {item.expiry_date || "無限期"}
                </p>
                <div className={styles.rowInfo}>
                  <p>
                    <strong>低消：</strong>{" "}
                    {item.min_purchase ? `$${item.min_purchase}` : "無"}
                  </p>

                  {/* 加一個分隔線或間距 */}
                  <span className={styles.separator}>|</span>

                  <p>
                    <strong>最高折抵：</strong>{" "}
                    {item.max_discount ? `$${item.max_discount}` : "無上限"}
                  </p>
                </div>
                <p>
                  <strong>對象：</strong> {item.membership_limit}
                </p>
              </div>

              {/* 只有未開始的活動可以修改，或者你可以開放全部都能修 */}
              {item.status === "SCHEDULED" && (
                <div className={styles.cardFooter}>
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.btnEdit}
                  >
                    修改
                  </button>
                  <button
                    onClick={() => handleDelete(item.id!)}
                    className={styles.btnDelete}
                  >
                    刪除
                  </button>
                </div>
              )}
              {/* 讓進行中的活動也能查看詳情或強制結束 (可選) */}
              {item.status === "ACTIVE" && (
                <div className={styles.cardFooter}>
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.btnEdit}
                  >
                    查看/編輯
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <PostDiscount
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={editingItem}
        existingCodes={discounts.map((d) => d.code)}
      />
    </div>
  );
}
