import { useState } from "react";
import styles from "./UserManagement.module.scss";

import { useCurrentUser } from "@/hooks/auth/user";
import {
  useAllCustomers,
  useBlockUser,
  useUnblockUser,
  type Customer,
} from "@/hooks/auth/admin";

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "blocked" | "active"
  >("all");

  const {
    data: customersData,
    isLoading,
    isError,
    refetch,
  } = useAllCustomers();

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const { data: user } = useCurrentUser();
  const adminId = user?.id;

  const handleToggleBlock = (customer: Customer) => {
    if (!adminId) {
      alert("無法取得管理員身分，請重新登入");
      return;
    }

    if (customer.is_active) {
      const reason = window.prompt(
        `請輸入封鎖顧客 ${customer.name} 的理由：`,
        "違反顧客規範"
      );

      if (!reason) return;

      blockUserMutation.mutate(
        {
          admin_id: adminId,
          target_user_id: customer.id,
          reason: reason,
        },
        {
          onSuccess: () => {
            alert(`已成功封鎖顧客：${customer.name}`);
            refetch();
          },
          onError: (err) => {
            alert("封鎖失敗：" + (err.message || "未知錯誤"));
          },
        }
      );
    } else {
      if (!window.confirm(`確定要解鎖 ${customer.name} 嗎？`)) return;

      unblockUserMutation.mutate(
        {
          admin_id: adminId,
          target_user_id: customer.id,
        },
        {
          onSuccess: () => {
            alert(`已成功解鎖顧客：${customer.name}`);
            refetch();
          },
          onError: (err) => {
            alert("解鎖失敗：" + (err.message || "未知錯誤"));
          },
        }
      );
    }
  };

  const customers = customersData || [];

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());

    const isBlocked = !c.is_active;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && isBlocked) ||
      (statusFilter === "active" && !isBlocked);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className={styles.container}>資料載入中...</div>;
  if (isError)
    return <div className={styles.container}>無法讀取資料，請稍後再試。</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Customer Management / 客戶管理</h2>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="搜尋姓名或 Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as "all" | "blocked" | "active")
          }
          className={styles.select}
        >
          <option value="all">全部 (All)</option>
          <option value="active">啟用中 (Active)</option>
          <option value="blocked">已封鎖 (Blocked)</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>User ID</th>
            <th className={styles.th}>姓名 (Name)</th>
            <th className={styles.th}>Email</th>
            <th className={styles.th}>狀態 (Status)</th>
            <th className={styles.th}>操作 (Action)</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((c) => {
            const isBlocked = !c.is_active;
            const isProcessing =
              blockUserMutation.isPending || unblockUserMutation.isPending;

            return (
              <tr key={c.id} className={styles.tr}>
                <td className={styles.td}>{c.id}</td>
                <td className={styles.td}>{c.name}</td>
                <td className={styles.td}>{c.email}</td>
                <td className={styles.td}>
                  <span
                    style={{
                      color: isBlocked ? "#e74c3c" : "#2ecc71",
                      fontWeight: "bold",
                    }}
                  >
                    {isBlocked ? "已封鎖" : "正常"}
                  </span>
                </td>
                <td className={styles.td}>
                  <button
                    disabled={isProcessing}
                    className={`${styles.toggleButton} ${
                      isBlocked ? styles.blocked : styles.active
                    }`}
                    onClick={() => handleToggleBlock(c)}
                  >
                    {isBlocked ? "解鎖 (Unblock)" : "封鎖 (Block)"}
                  </button>
                </td>
              </tr>
            );
          })}
          {filteredCustomers.length === 0 && (
            <tr>
              <td
                colSpan={5}
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                沒有符合條件的客戶。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
