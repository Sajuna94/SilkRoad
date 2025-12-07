import { useState } from "react";
import UserManagement from "./Tabs/UserManagement";
import SystemDashboard from "./Tabs/SystemDashboard";
import VendorManagement from "./Tabs/VendorManagement";
import styles from "./Dashboard.module.scss";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    { id: "user", name: "Customer Management" },
    { id: "system", name: "System Announcements" },
    { id: "vendor", name: "Vendor Management" },
  ];

  return (
    <div className={`${styles.dashboard} `}>
      {/* Sidebar */}
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

      {/* Main content */}
      <main className={`${styles.main}`}>
        {activeTab === "user" && <UserManagement />}
        {activeTab === "system" && <SystemDashboard />}
        {activeTab === "vendor" && <VendorManagement />}
      </main>
    </div>
  );
}
