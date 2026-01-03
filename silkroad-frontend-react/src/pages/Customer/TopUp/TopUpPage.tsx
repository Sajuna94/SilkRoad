import { useState } from "react";
import styles from "./TopUpPage.module.scss";
import { useTopUp, useCurrentUser } from "@/hooks/auth/user";

export default function TopUpPage() {
  const topUpMutation = useTopUp();
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const [manualAmount, setManualAmount] = useState<string>("");

  // Loading 狀態
  if (isLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>儲值中心</h1>
        <p style={{ textAlign: "center", padding: "2rem" }}>載入中...</p>
      </div>
    );
  }

  // 未登入或錯誤狀態
  if (isError || !currentUser) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>儲值中心</h1>
        <p style={{ textAlign: "center", padding: "2rem" }}>
          請先以顧客身份登入
        </p>
      </div>
    );
  }

  // 非 customer
  if (currentUser.role !== "customer") {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>儲值中心</h1>
        <p style={{ textAlign: "center", padding: "2rem" }}>
          此功能僅供顧客使用
        </p>
      </div>
    );
  }

  // 安全獲取餘額
  const balance = currentUser.stored_balance ?? 0;

  const handleManualSubmit = () => {
    const val = parseInt(manualAmount, 10);

    if (isNaN(val)) return;
    if (val <= 0) return alert("金額必須大於 0");
    if (val > 999999) return alert("單次上限為 999999");

    // 呼叫 API
    topUpMutation.mutate(
      { amount: val },
      {
        onSuccess: () => {
          alert(`成功儲值 $${val}`);
          setManualAmount("");
        },
        onError: (error) => {
          alert(`儲值失敗: ${error.response?.data?.message || "未知錯誤"}`);
        },
      }
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>儲值中心</h1>

      <div className={styles.balanceCard}>
        <span>目前餘額</span>
        <div className={styles.amount}>$ {balance.toLocaleString()}</div>
      </div>

      <div className={styles.section}>
        <h3>指定金額</h3>
        <div className={styles.inputGroup}>
          <input
            type="number"
            min="1"
            max="999999"
            placeholder="輸入 1 - 999999"
            value={manualAmount}
            onChange={(e) => setManualAmount(e.target.value)}
            className={styles.input}
          />
          <button
            className={styles.submitBtn}
            onClick={handleManualSubmit}
            disabled={!manualAmount || topUpMutation.isPending}
          >
            {topUpMutation.isPending ? "處理中..." : "確認儲值"}
          </button>
        </div>
      </div>
    </div>
  );
}
