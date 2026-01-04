import { useMemo, useState } from "react";
import styles from "./TopUpPage.module.scss";
import { useTopUp, useCurrentUser } from "@/hooks/auth/user";
import { FaFileInvoice } from "react-icons/fa";
import { useUserOrders } from "@/hooks/order/order";

const LEVEL_CONFIG = [
  { threshold: 10, label: "銅", color: "#cd7f32" },
  { threshold: 20, label: "銀", color: "#c0c0c0" },
  { threshold: 50, label: "金", color: "#ffd700" },
  { threshold: 100, label: "鑽石", color: "#b9f2ff" },
];

export default function TopUpPage() {
  const topUpMutation = useTopUp();
  const {
    data: currentUser,
    isLoading: isUserLoading,
    isError,
  } = useCurrentUser();
  const [manualAmount, setManualAmount] = useState<string>("");

  const customerId = currentUser?.id || 0;
  const { data: orders, isLoading: isOrderLoading } = useUserOrders(customerId);

  const completedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => o.is_completed === true);
  }, [orders]);

  const currentOrderCount = completedOrders.length;

  const maxThreshold = LEVEL_CONFIG[LEVEL_CONFIG.length - 1].threshold;

  const getPercent = (value: number) =>
    Math.min((value / maxThreshold) * 100, 100);

  const getCurrentIconColor = () => {
    const activeLevel = [...LEVEL_CONFIG]
      .reverse()
      .find((l) => currentOrderCount >= l.threshold);
    return activeLevel ? activeLevel.color : "#888";
  };

  if (isUserLoading || isOrderLoading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>儲值中心</h1>
        <p style={{ textAlign: "center", padding: "2rem" }}>載入中...</p>
      </div>
    );
  }

  if (customerId === 0 || isError || !currentUser) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>儲值中心</h1>
        <p style={{ textAlign: "center", padding: "2rem" }}>
          請先以顧客身份登入
        </p>
      </div>
    );
  }

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

  const balance = currentUser.stored_balance ?? 0;

  const handleManualSubmit = () => {
    const val = parseInt(manualAmount, 10);

    if (isNaN(val)) return;
    if (val <= 0) return alert("金額必須大於 0");
    if (val > 999999) return alert("單次上限為 999999");

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

      <div className={styles.progressSection}>
        <div className={styles.iconWrapper}>
          <FaFileInvoice size={48} style={{ color: getCurrentIconColor() }} />
          <span className={styles.orderCount}>
            已完成 {currentOrderCount} 筆訂單
          </span>
        </div>

        <div className={styles.progressBarWrapper}>
          <div className={styles.track}>
            <div
              className={styles.fill}
              style={{ width: `${getPercent(currentOrderCount)}%` }}
            />
          </div>

          <div className={styles.pointsContainer}>
            {LEVEL_CONFIG.map((config) => (
              <div
                key={config.threshold}
                className={styles.pointWrapper}
                style={{ left: `${getPercent(config.threshold)}%` }}
              >
                <div
                  className={`${styles.dot} ${
                    currentOrderCount >= config.threshold ? styles.active : ""
                  }`}
                />
                <span className={styles.pointLabel}>{config.threshold}</span>
              </div>
            ))}
          </div>
        </div>
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
