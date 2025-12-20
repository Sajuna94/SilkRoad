import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./SystemDashboard.module.scss";
import {
  useAllAnnouncements,
  usePostAnnouncement,
  useUpdateAnnouncement, // 新增：更新用的 Hook
  useDeleteAnnouncement, // 新增：刪除用的 Hook
} from "@/hooks/auth/admin";
import { useCurrentUser } from "@/hooks/auth/user";

export default function SystemDashboard() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  const adminId = user?.id || 1;

  // --- API Hooks ---
  const { data: apiData, isLoading, isError } = useAllAnnouncements();
  const postMutation = usePostAnnouncement();
  const updateMutation = useUpdateAnnouncement(); // 初始化 Hook
  const deleteMutation = useDeleteAnnouncement(); // 初始化 Hook

  // --- 狀態管理 ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [newSummary, setNewSummary] = useState("");

  // ★ 新增：編輯模式的狀態
  const [editingId, setEditingId] = useState<number | null>(null); // 目前正在編輯哪一個 ID
  const [editMessage, setEditMessage] = useState(""); // 編輯中的文字內容

  // --- 功能 1: 發布公告 ---
  const handlePost = () => {
    if (!newSummary.trim()) return alert("請輸入公告內容");
    postMutation.mutate(
      { admin_id: adminId, message: newSummary },
      {
        onSuccess: () => {
          alert("公告發布成功！");
          setNewSummary("");
          qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (err) => alert("發布失敗：" + err.message),
      }
    );
  };

  // --- 功能 2: 開始編輯 ---
  const startEdit = (id: number, currentMessage: string) => {
    setEditingId(id); // 設定當前編輯的 ID
    setEditMessage(currentMessage); // 把原本的文字帶入輸入框
  };

  // --- 功能 3: 取消編輯 ---
  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage("");
  };

  // --- 功能 4: 儲存編輯 (Update) ---
  const saveEdit = (id: number) => {
    if (!editMessage.trim()) return alert("公告內容不能為空");

    updateMutation.mutate(
      { announcement_id: id, admin_id: adminId, message: editMessage },
      {
        onSuccess: () => {
          alert("修改成功！");
          setEditingId(null); // 退出編輯模式
          qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (err) => alert("修改失敗：" + err.message),
      }
    );
  };

  // --- 功能 5: 刪除公告 (Delete) ---
  const handleDelete = (id: number) => {
    if (!confirm("確定要刪除這則公告嗎？此動作無法復原。")) return;

    deleteMutation.mutate(
      { announcement_id: id, admin_id: adminId },
      {
        onSuccess: () => {
          // alert("刪除成功"); // 刪除通常不一定要 alert，看需求
          qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (err) => alert("刪除失敗：" + err.message),
      }
    );
  };

  // --- 資料篩選 ---
  const displayAnnouncements = (apiData || []).filter((item) => {
    const dateStr = item.created_at?.split("T")[0] || "";
    const matchesSearch =
      item.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dateStr.includes(searchTerm);
    const matchesDate = selectedDate === "" || dateStr === selectedDate;
    return matchesSearch && matchesDate;
  });

  if (isLoading) return <div className={styles.container}>載入公告中...</div>;
  if (isError) return <div className={styles.container}>載入失敗</div>;

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>系統公告 / System Announcements</h2>

      {/* 新增區塊 */}
      <div
        className={styles.createSection}
        style={{ marginBottom: "20px", display: "flex", gap: "10px" }}
      >
        <input
          type="text"
          placeholder="輸入新公告內容..."
          value={newSummary}
          onChange={(e) => setNewSummary(e.target.value)}
          className={styles.input}
          style={{ flex: 1 }}
        />
        <button
          onClick={handlePost}
          disabled={postMutation.isPending}
          className={styles.actionBtn} // 建議在 SCSS 加個通用 class
          style={{ cursor: "pointer", padding: "0 20px" }}
        >
          {postMutation.isPending ? "..." : "發布"}
        </button>
      </div>

      {/* 篩選區塊 */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="搜尋..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={styles.input}
        />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* 表格區塊 */}
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Message</th>
            <th className={styles.th} style={{ width: "120px" }}>
              Date
            </th>
            <th className={styles.th} style={{ width: "160px" }}>
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {displayAnnouncements.length === 0 ? (
            <tr>
              <td colSpan={3} className={styles.td}>
                沒有符合的公告
              </td>
            </tr>
          ) : (
            displayAnnouncements.map((item) => {
              // 判斷此行是否處於「編輯模式」
              const isEditing = editingId === item.announcement_id;

              return (
                <tr key={item.announcement_id} className={styles.tr}>
                  {/* --- 欄位 1: 訊息內容 (根據模式切換顯示) --- */}
                  <td className={styles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className={styles.input}
                        style={{ width: "100%" }}
                        autoFocus // 自動聚焦
                      />
                    ) : (
                      item.message
                    )}
                  </td>

                  {/* --- 欄位 2: 日期 (純顯示) --- */}
                  <td className={styles.td}>{item.created_at.split("T")[0]}</td>

                  {/* --- 欄位 3: 操作按鈕 --- */}
                  <td className={styles.td}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {isEditing ? (
                        // 編輯模式下的按鈕：儲存 / 取消
                        <>
                          <button
                            onClick={() => saveEdit(item.announcement_id)}
                            disabled={updateMutation.isPending}
                            style={{
                              color: "green",
                              cursor: "pointer",
                              border: "none",
                              background: "none",
                            }}
                          >
                            儲存
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{
                              color: "#666",
                              cursor: "pointer",
                              border: "none",
                              background: "none",
                            }}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        // 檢視模式下的按鈕：編輯 / 刪除
                        <>
                          <button
                            onClick={() =>
                              startEdit(item.announcement_id, item.message)
                            }
                            style={{
                              color: "blue",
                              cursor: "pointer",
                              border: "none",
                              background: "none",
                            }}
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(item.announcement_id)}
                            disabled={deleteMutation.isPending}
                            style={{
                              color: "red",
                              cursor: "pointer",
                              border: "none",
                              background: "none",
                            }}
                          >
                            {deleteMutation.isPending &&
                            deleteMutation.variables?.announcement_id ===
                              item.announcement_id
                              ? "..."
                              : "刪除"}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
