import { useState, useRef } from "react";
import styles from "./TopUpPage.module.scss";
import { useTopUp, useCurrentUser } from "@/hooks/auth/user";

type FloatingItem = {
  id: number;
  amount: number;
  x: number;
  y: number;
  isCrit: boolean;
  scale: number; // 爆擊越大字越大
};

export default function TopUpPage() {
  const topUpMutation = useTopUp();
  const { data: currentUser, isLoading, isError } = useCurrentUser();

  const [manualAmount, setManualAmount] = useState<string>("");
  const [floatingItems, setFloatingItems] = useState<FloatingItem[]>([]);

  const itemIdRef = useRef(0);

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

  // 計算機率與金額
  const calculateWin = () => {
    const rand = Math.random() * 100;
    // 累加機率區間：
    // 0 ~ 1.5: 5000 (1.5%)
    // 1.5 ~ 4.5: 2000 (3%)
    // 4.5 ~ 9.5: 1000 (5%)
    // 9.5 ~ 19.5: 500 (10%)
    // 19.5 ~ 39.5: 200 (20%)
    // 39.5 ~ 100: 100 (其餘 60.5%)

    if (rand < 1.5) return { amount: 5000, scale: 3, isCrit: true };
    if (rand < 4.5) return { amount: 2000, scale: 2.5, isCrit: true };
    if (rand < 9.5) return { amount: 1000, scale: 2, isCrit: true };
    if (rand < 19.5) return { amount: 500, scale: 1.5, isCrit: true };
    if (rand < 39.5) return { amount: 200, scale: 1.2, isCrit: true };

    return { amount: 100, scale: 1, isCrit: false }; // 保底
  };

  const handleLuckyClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const { amount, scale, isCrit } = calculateWin();

    // 呼叫 API
    topUpMutation.mutate({ amount });

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newItem: FloatingItem = {
      id: itemIdRef.current++,
      amount,
      x,
      y,
      isCrit,
      scale,
    };
    setFloatingItems((prev) => [...prev, newItem]);

    // 自動清理動畫物件 (配合 CSS動畫時間 1秒後移除)
    setTimeout(() => {
      setFloatingItems((prev) => prev.filter((item) => item.id !== newItem.id));
    }, 1000);
  };

  const handleManualSubmit = () => {
    const val = parseInt(manualAmount, 10);

    if (isNaN(val)) return;
    if (val <= 0) return alert("金額必須大於 0");
    if (val > 9999) return alert("單次上限為 9999");

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
        <h3>幸運補給</h3>
        <p className={styles.desc}>
          每次點擊獲得 $100，有機會爆擊獲得最高 $5000！
        </p>

        <button className={styles.luckyBtn} onClick={handleLuckyClick}>
          <span className={styles.btnText}>點我儲值</span>

          {floatingItems.map((item) => (
            <span
              key={item.id}
              className={`${styles.floatingItem} ${
                item.isCrit ? styles.crit : ""
              }`}
              style={{
                left: item.x,
                top: item.y,
                ["--scale" as any]: item.scale,
              }}
            >
              +{item.amount}
            </span>
          ))}
        </button>
      </div>

      <hr className={styles.divider} />

      <div className={styles.section}>
        <h3>指定金額 (Manual Input)</h3>
        <div className={styles.inputGroup}>
          <input
            type="number"
            min="0"
            max="9999"
            placeholder="輸入 0 - 9999"
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
