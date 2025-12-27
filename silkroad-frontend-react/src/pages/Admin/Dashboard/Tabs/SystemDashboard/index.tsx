import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import styles from "./SystemDashboard.module.scss";
import {
  useAllAnnouncements,
  usePostAnnouncement,
  useUpdateAnnouncement,
  useDeleteAnnouncement,
} from "@/hooks/auth/admin";
import { useCurrentUser } from "@/hooks/auth/user";

export default function SystemDashboard() {
  const qc = useQueryClient();
  const { data: user } = useCurrentUser();
  const adminId = user?.id || 1;

  const { data: apiData, isLoading, isError } = useAllAnnouncements();
  const postMutation = usePostAnnouncement();
  const updateMutation = useUpdateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [newSummary, setNewSummary] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editMessage, setEditMessage] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

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

  const startEdit = (id: number, currentMessage: string) => {
    setEditingId(id);
    setEditMessage(currentMessage);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditMessage("");
  };

  const saveEdit = (id: number) => {
    if (!editMessage?.trim()) return alert("公告內容不能為空");

    updateMutation.mutate(
      {
        announcement_id: id,
        admin_id: adminId,
        message: editMessage,
      },
      {
        onSuccess: () => {
          alert("修改成功！");
          setEditingId(null);
          setEditMessage("");
          qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: (err) => alert("修改失敗：" + err.message),
      }
    );
  };

  const handleDelete = (id: number) => {
    if (!confirm("確定要刪除這則公告嗎？此動作無法復原。")) return;

    setDeletingId(id);

    deleteMutation.mutate(
      { announcement_id: id, admin_id: adminId },
      {
        onSuccess: () => {
          setDeletingId(null);
          qc.invalidateQueries({ queryKey: ["admin", "announcements"] });
        },
        onError: () => {
          setDeletingId(null);
          alert("刪除失敗");
        },
      }
    );
  };

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
      <h2 className={styles.title}>系統公告</h2>

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
          style={{ cursor: "pointer", padding: "0 20px" }}
        >
          {postMutation.isPending ? "..." : "發布"}
        </button>
      </div>

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

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Announcement ID</th>
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
              const isEditing = editingId === item.id;

              return (
                <tr key={item.id} className={styles.tr}>
                  <td className={styles.td}>
                    <div>#{item.id}</div>
                  </td>
                  <td className={styles.td}>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editMessage}
                        onChange={(e) => setEditMessage(e.target.value)}
                        className={styles.input}
                        style={{ width: "100%" }}
                        autoFocus
                      />
                    ) : (
                      item.message
                    )}
                  </td>

                  <td className={styles.td}>{item.created_at.split("T")[0]}</td>

                  <td className={styles.td}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      {isEditing ? (
                        <>
                          <button
                            onClick={() => saveEdit(item.id)}
                            disabled={updateMutation.isPending}
                            className={`${styles.actionBtn} ${styles.save}`}
                          >
                            儲存
                          </button>
                          <button
                            onClick={cancelEdit}
                            className={`${styles.actionBtn} ${styles.cancel}`}
                          >
                            取消
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(item.id, item.message)}
                            className={`${styles.actionBtn} ${styles.edit}`}
                          >
                            編輯
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingId === item.id}
                            className={`${styles.actionBtn} ${styles.delete}`}
                          >
                            {deletingId === item.id ? "..." : "刪除"}
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
