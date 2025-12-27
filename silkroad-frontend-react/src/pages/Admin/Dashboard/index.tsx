import { useState } from "react";
import UserManagement from "./Tabs/UserManagement";
import SystemDashboard from "./Tabs/SystemDashboard";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    { id: "user", name: "User Management" },
    { id: "system", name: "System Announcements" },
  ];

  return (
    <div className={`${styles.dashboard} `}>
      <aside className={`${styles.sidebar}`}>
        <div className={styles.headerTitle}>Admin Dashboard</div>
        <nav>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.active : ""
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </aside>

      <main className={`${styles.main}`}>
        {activeTab === "user" && <UserManagement />}
        {activeTab === "system" && <SystemDashboard />}
      </main>
    </div>
  );
}
