import { useState } from "react";
import styles from "./UserManagement.module.scss";

import { useCurrentUser } from "@/hooks/auth/user";
import {
  useAllCustomers,
  useAllVendors,
  useBlockUser,
  useUnblockUser,
} from "@/hooks/auth/admin";

import type { Customer, Vendor } from "@/types/user";

type TabType = "customer" | "vendor";

export default function UserManagement() {
  const [activeTab, setActiveTab] = useState<TabType>("customer");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "blocked"
  >("all");

  const { data: user } = useCurrentUser();
  const adminId = user?.id;

  const {
    data: customersData,
    isLoading: isCustomerLoading,
    refetch: refetchCustomers,
  } = useAllCustomers();

  const {
    data: vendorsData,
    isLoading: isVendorLoading,
    refetch: refetchVendors,
  } = useAllVendors();

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const handleToggleBlock = (targetUser: Customer | Vendor) => {
    if (!adminId) return alert("無法取得管理員身分，請重新登入");

    const isBlocked = !targetUser.is_active;
    const userType = activeTab === "customer" ? "客戶" : "商家";

    if (!isBlocked) {
      const reason = window.prompt(
        `請輸入封鎖${userType} ${targetUser.name} 的理由：`,
        `違反${userType}規範`
      );
      if (!reason) return;

      blockUserMutation.mutate(
        {
          admin_id: adminId,
          target_user_id: targetUser.id,
          reason,
        },
        {
          onSuccess: () => {
            alert(`已封鎖${userType}：${targetUser.name}`);
            activeTab === "customer" ? refetchCustomers() : refetchVendors();
          },
          onError: (err) => alert("封鎖失敗：" + err.message),
        }
      );
    } else {
      if (!window.confirm(`確定要解鎖 ${targetUser.name} 嗎？`)) return;

      unblockUserMutation.mutate(
        { admin_id: adminId, target_user_id: targetUser.id },
        {
          onSuccess: () => {
            alert(`已解鎖${userType}：${targetUser.name}`);
            activeTab === "customer" ? refetchCustomers() : refetchVendors();
          },
          onError: (err) => alert("解鎖失敗：" + err.message),
        }
      );
    }
  };

  const currentData =
    activeTab === "customer" ? customersData || [] : vendorsData || [];
  const isLoading =
    activeTab === "customer" ? isCustomerLoading : isVendorLoading;

  const filteredData = currentData.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase());

    const isBlocked = !item.is_active;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && isBlocked) ||
      (statusFilter === "active" && !isBlocked);

    return matchesSearch && matchesStatus;
  });

  if (isLoading) return <div className={styles.container}>資料載入中...</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>使用者管理 / User Management</h2>
      <div className={styles.filters}>
        <select
          value={activeTab}
          onChange={(e) => setActiveTab(e.target.value as TabType)}
          className={styles.select}
          style={{ minWidth: "150px" }}
        >
          <option value="customer">客戶列表 (Customer)</option>
          <option value="vendor">商家列表 (Vendor)</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={styles.select}
        >
          <option value="all">全部狀態 (All)</option>
          <option value="active">正常/營業中 (Active)</option>
          <option value="blocked">已封鎖/停權 (Blocked)</option>
        </select>

        <input
          type="text"
          placeholder="搜尋姓名或 Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
          style={{ flex: 1 }}
        />
      </div>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>Name</th>
            <th className={styles.th}>Email</th>
            {activeTab === "vendor" && <th className={styles.th}>Phone</th>}
            {activeTab === "vendor" && <th className={styles.th}>Address</th>}
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => {
            const isBlocked = !item.is_active;
            const isProcessing =
              blockUserMutation.isPending || unblockUserMutation.isPending;

            return (
              <tr key={item.id} className={styles.tr}>
                <td className={styles.td}>#{item.id}</td>
                <td className={styles.td}>
                  <strong>{item.name}</strong>
                </td>
                <td className={styles.td}>{item.email}</td>

                {activeTab === "vendor" && (
                  <>
                    <td className={styles.td}>
                      {(item as Vendor).phone_number}
                    </td>
                    <td className={styles.td}>{(item as Vendor).address}</td>
                  </>
                )}

                <td className={styles.td}>
                  <span>{isBlocked ? "Blocked" : "Active"}</span>
                </td>
                <td className={styles.td}>
                  <button
                    disabled={isProcessing}
                    className={`${styles.toggleButton} ${
                      isBlocked ? styles.blocked : styles.active
                    }`}
                    onClick={() => handleToggleBlock(item)}
                  >
                    {isBlocked ? "解鎖" : "封鎖"}
                  </button>
                </td>
              </tr>
            );
          })}

          {filteredData.length === 0 && (
            <tr>
              <td
                colSpan={activeTab === "vendor" ? 7 : 5}
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                沒有符合條件的資料。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
