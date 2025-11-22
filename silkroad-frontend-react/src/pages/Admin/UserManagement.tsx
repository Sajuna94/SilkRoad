import { useState } from "react";
import styles from "./UserManagement.module.scss";

interface Customer {
  id: number;
  username: string;
  blocked: boolean;
}

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "blocked" | "active">("all");

  const [customers, setCustomers] = useState<Customer[]>([
    { id: 1, username: "tea_lover", blocked: true },
    { id: 2, username: "coollatte", blocked: false },
    { id: 3, username: "milkfan", blocked: false },
  ]);

  const toggleBlocked = (id: number) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, blocked: !c.blocked } : c
      )
    );
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch = c.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "blocked" && c.blocked) ||
      (statusFilter === "active" && !c.blocked);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Customer Management / 客戶管理</h2>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="搜尋 Username..."
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
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>User ID</th>
            <th className={styles.th}>Username</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredCustomers.map((c) => (
            <tr key={c.id} className={styles.tr}>
              <td className={styles.td}>{c.id}</td>
              <td className={styles.td}>{c.username}</td>
              <td className={styles.td}>{c.blocked ? "Blocked" : "Active"}</td>
              <td className={styles.td}>
                <button
                  className={`${styles.toggleButton} ${
                    c.blocked ? styles.blocked : styles.active
                  }`}
                  onClick={() => toggleBlocked(c.id)}
                >
                  {c.blocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
