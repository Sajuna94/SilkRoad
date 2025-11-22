import { useState } from "react";
import styles from "./SystemDashboard.module.scss";

interface Announcement {
  id: number;
  date: string;
  summary: string;
}

export default function SystemDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const announcements: Announcement[] = [
    {
      id: 1,
      date: "2025-11-05",
      summary: "We’ve improved delivery tracking and site performance.",
    },
    {
      id: 2,
      date: "2025-11-10",
      summary: "We've fixed certain bugs.",
    },
  ];

  const filteredAnnouncements = announcements.filter(
    (item) => 
      (item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
       item.date.includes(searchTerm)) &&
      (selectedDate === "" || item.date === selectedDate)
  );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>系統公告 / System Announcements</h2>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="搜尋訊息或日期..."
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
            <th className={styles.th}>Message</th>
            <th className={styles.th}>Date</th>
          </tr>
        </thead>
        <tbody>
          {filteredAnnouncements.map((item) => (
            <tr key={item.id} className={styles.tr}>
              <td className={styles.td}>{item.summary}</td>
              <td className={styles.td}>{item.date}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
