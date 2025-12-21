import { useState } from "react";
import styles from "./VendorManagement.module.scss";

import { useCurrentUser } from "@/hooks/auth/user";
import {
  useAllVendors,
  useBlockUser,
  useUnblockUser,
  type Vendor,
} from "@/hooks/auth/admin";

export default function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "suspended"
  >("all");

  const { data: vendorsData, isLoading, isError, refetch } = useAllVendors();

  const blockUserMutation = useBlockUser();
  const unblockUserMutation = useUnblockUser();

  const { data: user } = useCurrentUser();
  const adminId = user?.id;

  const handleToggleBlock = (vendor: Vendor) => {
    if (!adminId) {
      alert("無法取得管理員身分，請重新登入");
      return;
    }

    const isVendorActive = vendor.is_active;

    if (isVendorActive) {
      const reason = window.prompt(
        `請輸入封鎖商家 ${vendor.name} 的理由：`,
        "違反商家規範"
      );
      if (!reason) return;

      blockUserMutation.mutate(
        {
          admin_id: adminId,
          target_user_id: vendor.id,
          reason: reason,
        },
        {
          onSuccess: () => {
            alert(`已成功封鎖商家：${vendor.name}`);
            refetch();
          },
          onError: (err) => {
            alert(`封鎖失敗：${err.message || "未知錯誤"}`);
          },
        }
      );
    } else {
      if (!window.confirm(`確定要恢復商家 ${vendor.name} 的權限嗎？`)) return;

      unblockUserMutation.mutate(
        {
          admin_id: adminId,
          target_user_id: vendor.id,
        },
        {
          onSuccess: () => {
            alert(`已成功恢復商家：${vendor.name}`);
            refetch();
          },
          onError: (err) => {
            alert(`解鎖失敗：${err.message || "未知錯誤"}`);
          },
        }
      );
    }
  };

  const vendors = vendorsData || [];

  const filteredVendors = vendors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());

    const isActive = v.is_active;

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "suspended" && !isActive);

    return matchesSearch && matchesStatus;
  });

  if (isLoading)
    return <div className={styles.container}>載入商家資料中...</div>;
  if (isError)
    return <div className={styles.container}>載入失敗，請稍後再試。</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>商家管理 / Vendor Management</h2>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="搜尋商家名稱或 Email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className={styles.select}
        >
          <option value="all">全部狀態 (All)</option>
          <option value="active">營業中 (Active)</option>
          <option value="suspended">停權中 (Suspended)</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>ID</th>
            <th className={styles.th}>商家名稱</th>
            <th className={styles.th}>聯絡資訊</th>
            <th className={styles.th}>地址</th>
            <th className={styles.th}>狀態</th>
            <th className={styles.th}>操作</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {filteredVendors.map((vendor) => {
            const isSuspended = !vendor.is_active;
            const isProcessing =
              blockUserMutation.isPending || unblockUserMutation.isPending;

            return (
              <tr key={vendor.id} className={styles.tr}>
                <td className={styles.td}>#{vendor.id}</td>
                <td className={styles.td}>
                  <strong>{vendor.name}</strong>
                </td>
                <td className={styles.td}>
                  <div>
                    {vendor.email}
                    <br />
                    {vendor.phone_number}
                  </div>
                </td>
                <td className={styles.td}>{vendor.address}</td>
                <td className={styles.td}>
                  <span>{isSuspended ? "Suspended" : "Active"}</span>
                </td>
                <td className={styles.td}>
                  <button
                    disabled={isProcessing}
                    className={`${styles.toggleButton} ${
                      isSuspended ? styles.blocked : styles.active
                    }`}
                    onClick={() => handleToggleBlock(vendor)}
                  >
                    {isSuspended ? "解鎖 (Unblock)" : "停權 (Block)"}
                  </button>
                </td>
              </tr>
            );
          })}

          {filteredVendors.length === 0 && (
            <tr>
              <td
                colSpan={6}
                style={{ textAlign: "center", padding: "20px", color: "#666" }}
              >
                沒有符合條件的商家。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
