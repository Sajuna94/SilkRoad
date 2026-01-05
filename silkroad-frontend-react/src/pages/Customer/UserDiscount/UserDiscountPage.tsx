import { useState, useMemo } from "react";
import styles from "./UserDiscountPage.module.scss";
import { Link } from "react-router-dom";

import { useCurrentUser } from "@/hooks/auth/user";
import { useViewCustomerDiscountPolicies } from "@/hooks/order/discount";
import type { CustomerDiscountPolicy } from "@/types/order";
import BlockModal from "@/components/atoms/BlockModal/BlockModal";

export type DiscountType = "PERCENTAGE" | "FIXED";
export type MembershipLevel = "ALL" | "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";

export interface DiscountData {
  id: string;
  code: string;
  vendor_name: string;
  vendor_id: number;
  expiry_date: string;
  type: DiscountType;
  value: number;
  min_purchase: string;
  max_discount: string;
  membership_limit: MembershipLevel;
  status?: string;
}

const mapMembershipLevel = (levelId: number): MembershipLevel => {
  const map: Record<number, MembershipLevel> = {
    0: "ALL",
    1: "BRONZE",
    2: "SILVER",
    3: "GOLD",
    4: "DIAMOND",
  };
  return map[levelId] || "ALL";
};

const transformPolicy = (policy: CustomerDiscountPolicy): DiscountData => {
  return {
    id: policy.policy_id.toString(),
    code: policy.code || "No Code",
    vendor_name: policy.vendor_name || `商家 #${policy.vendor_id}`,
    vendor_id: policy.vendor_id,
    expiry_date: policy.expiry_date || "",
    type: policy.type === "percent" ? "PERCENTAGE" : "FIXED",
    value: policy.value,
    min_purchase: policy.min_purchase?.toString() || "0",
    max_discount: policy.max_discount?.toString() || "",
    membership_limit: mapMembershipLevel(policy.membership_limit),
    status: policy.status, // 如果有的話
  };
};

// 定義篩選狀態的型別
type StatusFilter = "ALL" | "ACTIVE" | "EXPIRED";
type TypeFilter = "ALL" | DiscountType;
type SortOption = "DEFAULT" | "EXPIRY_SOON" | "EXPIRY_FAR";

export default function UserDiscountPage() {
  const { data: currentUser, isLoading: isUserLoading } = useCurrentUser();
  const customerId = currentUser?.id || 0;

  const {
    data: apiData,
    isLoading: isDiscountsLoading,
    isError,
  } = useViewCustomerDiscountPolicies(customerId);

  const discounts: DiscountData[] = useMemo(() => {
    if (!apiData?.data || !Array.isArray(apiData.data)) return [];
    return apiData.data.map(transformPolicy);
  }, [apiData]);

  // 篩選器狀態
  const [searchTerm, setSearchTerm] = useState("");
  const [searchVendor, setSearchVendor] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [membershipFilter, setMembershipFilter] =
    useState<MembershipLevel>("ALL");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL");
  const [sortOption, setSortOption] = useState<SortOption>("EXPIRY_SOON");

  // 複製功能
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert(`折扣碼 ${code} 已複製！`);
  };

  const formatMembership = (level: MembershipLevel) => {
    const map = {
      ALL: "所有會員",
      BRONZE: "銅牌會員以上",
      SILVER: "銀牌會員以上",
      GOLD: "金牌會員以上",
      DIAMOND: "鑽石會員以上",
    };
    return map[level] || level;
  };

  const checkIsExpired = (dateString: string) => {
    if (!dateString) return false;
    // 設定為當天的最後一秒，避免當天就過期
    const expiry = new Date(dateString);
    expiry.setHours(23, 59, 59, 999);
    return expiry < new Date();
  };

  const filteredDiscounts = useMemo(() => {
    let result = discounts.filter((item) => {
      const isExpired = checkIsExpired(item.expiry_date);

      if (statusFilter === "ACTIVE" && isExpired) return false;
      if (statusFilter === "EXPIRED" && !isExpired) return false;

      if (
        membershipFilter !== "ALL" &&
        item.membership_limit !== membershipFilter
      ) {
        return false;
      }

      if (
        searchTerm &&
        !item.code.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      if (
        searchVendor &&
        !item.vendor_name.toLowerCase().includes(searchVendor.toLowerCase())
      ) {
        return false;
      }

      if (typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }

      return true;
    });

    if (sortOption !== "DEFAULT") {
      result.sort((a, b) => {
        // 如果沒有期限，視為無限遠，排在最後面 (或最前面，看需求)
        // 這裡設定：沒有期限 = 權重最大 (最遠)
        const dateA = a.expiry_date
          ? new Date(a.expiry_date).getTime()
          : Number.MAX_SAFE_INTEGER;
        const dateB = b.expiry_date
          ? new Date(b.expiry_date).getTime()
          : Number.MAX_SAFE_INTEGER;

        if (sortOption === "EXPIRY_SOON") {
          return dateA - dateB; // 數字小(日期早)在前
        } else {
          return dateB - dateA; // 數字大(日期晚)在前
        }
      });
    }

    return result;
  }, [
    discounts,
    statusFilter,
    membershipFilter,
    searchTerm,
    searchVendor,
    typeFilter,
    sortOption,
  ]);

  if (isUserLoading || isDiscountsLoading) {
    return <div className={styles.container}>載入優惠券中...</div>;
  }

  if (isError) {
    return (
      <div className={styles.container}>無法載入優惠券資料，請稍後再試。</div>
    );
  }

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <p style={{ textAlign: "center", padding: "40px" }}>
          請先登入以查看您的優惠券
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <BlockModal />
      <header className={styles.pageHeader}>
        <h1>專屬優惠券</h1>
        <p>查看您的專屬折扣，享受購物樂趣</p>
      </header>

      <div className={styles.filterSection}>
        <div className={styles.filterGroup}>
          <label>搜尋商家</label>
          <input
            type="text"
            placeholder="輸入商家名稱..."
            value={searchVendor}
            onChange={(e) => setSearchVendor(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.filterGroup}>
          <label>狀態</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className={styles.select}
          >
            <option value="ALL">全部顯示</option>
            <option value="ACTIVE">可使用 (未過期)</option>
            <option value="EXPIRED">歷史紀錄 (已過期)</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>會員等級</label>
          <select
            value={membershipFilter}
            onChange={(e) =>
              setMembershipFilter(e.target.value as MembershipLevel)
            }
            className={styles.select}
          >
            <option value="ALL">全部等級</option>
            <option value="BRONZE">銅牌會員以上</option>
            <option value="SILVER">銀牌會員以上</option>
            <option value="GOLD">金牌會員以上</option>
            <option value="DIAMOND">鑽石會員專屬</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>排序方式</label>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            className={styles.select}
          >
            <option value="EXPIRY_SOON">期限由近到遠</option>
            <option value="EXPIRY_FAR">期限由遠到近</option>
            <option value="DEFAULT">預設排序</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label>折扣類型</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className={styles.select}
          >
            <option value="ALL">全部類型</option>
            <option value="PERCENTAGE">折扣 (%)</option>
            <option value="FIXED">定額 ($)</option>
          </select>
        </div>

        <div className={styles.filterGroup} style={{ flex: 1.5 }}>
          <label>搜尋代碼</label>
          <input
            type="text"
            placeholder="輸入折扣碼..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.grid}>
        {filteredDiscounts.map((item) => {
          const expired = checkIsExpired(item.expiry_date);

          return (
            <div
              key={item.id}
              className={`${styles.couponCard} ${
                expired ? styles.expired : ""
              }`}
            >
              <div className={styles.leftSide}>
                <div className={styles.value}>
                  {item.type === "FIXED" ? (
                    <>
                      <span className={styles.symbol}>$</span>
                      {item.value}
                    </>
                  ) : (
                    <>
                      {item.value}
                      <span className={styles.symbol}>%</span>
                      <span className={styles.off}>OFF</span>
                    </>
                  )}
                </div>
                <div className={styles.typeLabel}>
                  {item.type === "FIXED" ? "現金折抵" : "折扣優惠"}
                </div>
              </div>

              <div className={styles.middleSide}>
                <Link
                  to={`/vendor/${item.vendor_id}`}
                  className={styles.vendorNameLink}
                  title={`前往 ${item.vendor_name} 頁面`}
                >
                  {item.vendor_name}
                </Link>
                <div className={styles.conditions}>
                  {Number(item.min_purchase) > 0 ? (
                    <p>• 低消 ${item.min_purchase}</p>
                  ) : (
                    <p>• 無低消限制</p>
                  )}
                  {item.type === "PERCENTAGE" && item.max_discount && (
                    <p>• 最高折抵 ${item.max_discount}</p>
                  )}
                  <p>• 適用：{formatMembership(item.membership_limit)}</p>
                </div>
                <div className={styles.expiry}>
                  有效期限：{item.expiry_date || "無期限"}
                </div>
              </div>

              <div className={styles.rightSide}>
                <div className={styles.codeLabel}>CODE</div>
                <div className={styles.code}>{item.code}</div>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopyCode(item.code)}
                  disabled={expired}
                >
                  {expired ? "已過期" : "複製代碼"}
                </button>
              </div>

              <div className={`${styles.circle} ${styles.top}`}></div>
              <div className={`${styles.circle} ${styles.bottom}`}></div>
            </div>
          );
        })}

        {filteredDiscounts.length === 0 && (
          <div className={styles.emptyState}>
            沒有符合條件的優惠券
            {discounts.length > 0 && (
              <p style={{ fontSize: "0.9rem", marginTop: "8px" }}>
                請嘗試調整篩選條件
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
