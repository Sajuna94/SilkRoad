import { useState, useMemo } from "react";
import styles from "./DiscountManagement.module.scss";
import PostDiscount, { type DiscountForm } from "../DiscountFormModal";
import {
  useViewDiscountPolicies,
  useAddDiscountPolicy,
  useInvalidDiscountPolicy,
  useUpdateDiscountPolicy,
} from "@/hooks/order/discount";
import { useCurrentUser } from "@/hooks/auth/user";
import type { DiscountPolicy } from "@/types/order";

const extractErrorMessage = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.message === "Network Error") {
    return "網絡連接失敗，請檢查您的網絡";
  }

  if (error.code === "ECONNABORTED") {
    return "請求超時，請稍後再試";
  }

  // 根據狀態碼提供默認信息
  const status = error.response?.status;
  switch (status) {
    case 400:
      return "請求參數錯誤，請檢查輸入內容";
    case 401:
      return "您尚未登入，請重新登入";
    case 403:
      return "您沒有權限執行此操作";
    case 404:
      return "請求的資源不存在";
    case 500:
      return "伺服器錯誤，請稍後再試";
    default:
      return error.message || "操作失敗，請稍後再試";
  }
};

const backendToFrontend = (policy: DiscountPolicy): DiscountForm => {
  const membershipMap: Record<number, DiscountForm["membership_limit"]> = {
    0: "ALL",
    1: "BRONZE",
    2: "SILVER",
    3: "GOLD",
  };

  return {
    id: policy.policy_id.toString(),
    code: policy.code || "",
    start_date: policy.start_date || "",
    expiry_date: policy.expiry_date || "",
    type: policy.type === "percent" ? "PERCENTAGE" : "FIXED",
    value: policy.value,
    min_purchase: policy.min_purchase?.toString() || "",
    max_discount: policy.max_discount?.toString() || "",
    membership_limit: membershipMap[policy.membership_limit] || "ALL",
  };
};

const frontendToBackend = (form: DiscountForm, vendorId: number) => {
  const membershipMap: Record<DiscountForm["membership_limit"], number> = {
    ALL: 0,
    BRONZE: 1,
    SILVER: 2,
    GOLD: 3,
    DIAMOND: 4,
  };

  return {
    vendor_id: vendorId,
    code: form.code || undefined,
    type: (form.type === "PERCENTAGE" ? "percent" : "fixed") as
      | "percent"
      | "fixed",
    value: form.value,
    min_purchase: form.min_purchase ? parseInt(form.min_purchase) : undefined,
    max_discount: form.max_discount ? parseInt(form.max_discount) : undefined,
    membership_limit: membershipMap[form.membership_limit],
    start_date: form.start_date || undefined,
    expiry_date: form.expiry_date || undefined,
  };
};

type TabStatus = "ALL" | "ACTIVE" | "SCHEDULED" | "EXPIRED";

export default function DiscountManagement() {
  // 獲取當前登錄用戶（vendor）
  const currentUser = useCurrentUser();

  const vendorId =
    currentUser.isSuccess && currentUser.data.role === "vendor"
      ? currentUser.data.id
      : 0;

  const discountPoliciesQuery = useViewDiscountPolicies(vendorId);
  const addDiscountMutation = useAddDiscountPolicy();
  const updateDiscountMutation = useUpdateDiscountPolicy();
  const invalidDiscountMutation = useInvalidDiscountPolicy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DiscountForm | null>(null);

  const [currentTab, setCurrentTab] = useState<TabStatus>("ALL");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState<"ALL" | "PERCENTAGE" | "FIXED">(
    "ALL"
  );
  const [filterMembership, setFilterMembership] = useState<string>("ALL");

  // 將後端數據轉換為前端格式
  const discounts = useMemo(() => {
    if (!discountPoliciesQuery.data?.data) return [];
    return discountPoliciesQuery.data.data.map(backendToFrontend);
  }, [discountPoliciesQuery.data]);

  const today = new Date().toISOString().split("T")[0];

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

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item: DiscountForm) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!vendorId || vendorId === 0) {
      alert("無法獲取商家 ID，請重新登入");
      return;
    }

    if (window.confirm("確定停用此活動？")) {
      invalidDiscountMutation.mutate(
        {
          policy_id: parseInt(id),
          vendor_id: vendorId,
        },
        {
          onSuccess: () => {
            alert("折價券已停用");
          },
          onError: (error) => {
            const errorMsg = extractErrorMessage(error);
            alert(`停用失敗\n\n${errorMsg}`);
          },
        }
      );
    }
  };

  const handleSubmit = (formData: DiscountForm) => {
    if (!vendorId || vendorId === 0) {
      alert("無法獲取商家 ID，請重新登入");
      return;
    }

    const payload = frontendToBackend(formData, vendorId);

    if (editingItem) {
      if (!editingItem.id) {
        console.error("編輯模式錯誤：找不到 Discount ID");
        alert("系統錯誤：找不到該折扣券 ID");
        return;
      }

      const updatePayload = {
        ...payload,
        policy_id: parseInt(editingItem.id),
      };

      updateDiscountMutation.mutate(updatePayload, {
        onSuccess: () => {
          alert("折價券已更新");
          setIsModalOpen(false);
        },
        onError: (error) => {
          const errorMsg = extractErrorMessage(error);
          alert(`更新失敗\n\n${errorMsg}`);
        },
      });
    } else {
      // 新增模式：使用 add API
      addDiscountMutation.mutate(payload, {
        onSuccess: () => {
          alert("折價券新增成功");
          setIsModalOpen(false);
        },
        onError: (error) => {
          const errorMsg = extractErrorMessage(error);
          alert(`新增失敗\n\n${errorMsg}`);
        },
      });
    }
  };

  if (currentUser.isPending) {
    return <div className={styles.container}>載入用戶資料中...</div>;
  }

  if (!currentUser.isSuccess || currentUser.data.role !== "vendor") {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>您不是商家，無法訪問此頁面</div>
      </div>
    );
  }

  if (vendorId === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>無法獲取商家 ID，請重新登入</div>
      </div>
    );
  }

  if (discountPoliciesQuery.isLoading) {
    return <div className={styles.container}>載入折價券資料中...</div>;
  }

  if (discountPoliciesQuery.isError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          載入失敗: {discountPoliciesQuery.error.message || "未知錯誤"}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <div>
          <h1>折扣管理中心</h1>
          <p>管理您的促銷活動與優惠代碼</p>
        </div>
        <button
          className={styles.createBtn}
          onClick={handleCreate}
          disabled={
            addDiscountMutation.isPending || updateDiscountMutation.isPending
          }
        >
          + 新增折扣
        </button>
      </header>

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

              {/* 只有未開始的活動可以修改*/}
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
              {/* 進行中的活動也能查看詳情或強制結束*/}
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
