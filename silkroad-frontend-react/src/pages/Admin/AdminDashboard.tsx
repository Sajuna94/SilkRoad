import { useState } from "react";
import UserManagement from "./UserManagement";
import SystemDashboard from "./SystemDashboard";
import VendorManagement from "./VendorManagement";
import styles from "./AdminDashboard.module.scss";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    { id: "user", name: "User Management" },
    { id: "system", name: "System Announcements" },
    { id: "vendor", name: "Vendor Management" },
  ];

  return (
    <div className={`${styles.dashboard} flex`}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} animateSlideUp delay75`}>
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
        <nav className="space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tabButton} ${activeTab === tab.id ? "active" : ""}`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className={`${styles.main} animateFadeIn delay150`}>
        {activeTab === "user" && <UserManagement />}
        {activeTab === "system" && <SystemDashboard />}
        {activeTab === "vendor" && <VendorManagement />}
      </main>
    </div>
  );
}
