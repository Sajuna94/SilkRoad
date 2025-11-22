import styles from './UserManagement.module.scss';

export default function UserManagement() {
  const blockedUsers = [
    { id: 1, username: "tea_lover", reason: "Spam messages", date: "2025-11-10" },
    { id: 2, username: "coollatte", reason: "Harassment", date: "2025-11-11" },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        封鎖紀錄 / Blocked Users
      </h2>

      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={`${styles.th} w-1/4`}>Username</th>
            <th className={`${styles.th} w-1/2`}>Reason</th>
            <th className={`${styles.th} w-1/4`}>Date</th>
          </tr>
        </thead>

        <tbody className={styles.tbody}>
          {blockedUsers.map((user) => (
            <tr key={user.id} className={styles.tr}>
              <td className={styles.td}>{user.username}</td>
              <td className={styles.td}>{user.reason}</td>
              <td className={styles.td}>{user.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
