import { useState } from "react";
import UserManagement from "./UserManagement";
import SystemDashboard from "./SystemDashboard";
import VendorManagement from "./VendorManagement";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("user");

  const tabs = [
    { id: "user", name: "User Management"},
    { id: "system", name: "System Announcements"},
    { id: "vendor", name: "Vendor Management"},
  ];
  

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm p-6">
        <h1 className="text-2xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>
        <nav className="space-y-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 w-full px-4 py-2 rounded-lg transition ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === "user" && <UserManagement />}
        {activeTab === "system" && <SystemDashboard />}
        {activeTab === "vendor" && <VendorManagement />}
      </main>
    </div>
	
  );
}
