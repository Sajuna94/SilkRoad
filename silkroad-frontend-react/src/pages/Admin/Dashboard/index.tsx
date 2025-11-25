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
        <div className={`${styles.dashboard} flex`}>
            {/* Sidebar */}
            <aside className={`${styles.sidebar} animateSlideUp delay75`}>
                <h2 className="text-2xl font-bold mb-8 text-gray-800">Admin Dashboard</h2>
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
