import { useState, useMemo } from "react";
import styles from "./PolicyModal.module.scss";
import type { CustomerDiscountPolicy } from "@/types/order";

export type DisplayPolicy = CustomerDiscountPolicy & {
  isUsable: boolean;
  localReason?: string;
};

interface PolicyModalProps {
  policies: DisplayPolicy[];
  selectedPolicy: CustomerDiscountPolicy | null;
  onSelect: (policy: CustomerDiscountPolicy | null) => void;
  onClose: () => void;
}

export function PolicyModal({
  policies,
  selectedPolicy,
  onSelect,
  onClose,
}: PolicyModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPolicies = useMemo(() => {
    if (!searchTerm.trim()) return policies;

    return policies.filter((policy) =>
      policy.code?.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [policies, searchTerm]);

  const handleSelect = (policy: DisplayPolicy) => {
    if (!policy.isUsable) return;
    onSelect(policy);
    onClose();
  };

  return (
    <div className={styles["modal"]} onClick={onClose}>
      <div
        className={styles["modalContent"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>選擇折扣券</h2>

        <div className={styles["couponInputGroup"]}>
          <input
            type="text"
            placeholder="搜尋折扣碼..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles["input"]}
            autoFocus
          />
        </div>

        <hr className={styles["divider"]} />

        <div className={styles["policyList"]}>
          {filteredPolicies.length > 0 ? (
            filteredPolicies.map((policy) => (
              <div
                key={policy.policy_id}
                className={`${styles["policyItem"]} ${
                  selectedPolicy?.policy_id === policy.policy_id
                    ? styles["selected"]
                    : ""
                } ${!policy.isUsable ? styles["disabled"] : ""}`}
                onClick={() => handleSelect(policy)}
              >
                <div className={styles["policyHeader"]}>
                  <span className={styles["policyCode"]}>
                    {policy.code || `折扣券 #${policy.policy_id}`}
                  </span>
                  <span className={styles["policyValue"]}>
                    {policy.type === "percent"
                      ? `${policy.value}% OFF`
                      : `$${policy.value} OFF`}
                  </span>
                </div>
                <div className={styles["policyDetails"]}>
                  {policy.min_purchase > 0 && (
                    <div>最低消費：${policy.min_purchase}</div>
                  )}
                  {policy.max_discount && (
                    <div>最高折抵：${policy.max_discount}</div>
                  )}
                  {policy.expiry_date && (
                    <div>到期日：{policy.expiry_date}</div>
                  )}
                  {/* Show reason if disabled */}
                  {!policy.isUsable && (
                    <div style={{ color: "red", marginTop: "4px" }}>
                      {policy.localReason || policy.disable_reason || "不可用"}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className={styles["emptyText"]}>
              {searchTerm ? "找不到符合的折扣碼" : "目前無可用折扣券"}
            </p>
          )}
        </div>

        <button className={styles["closeBtn"]} onClick={onClose}>
          關閉
        </button>
      </div>
    </div>
  );
}
