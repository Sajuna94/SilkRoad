import { useState, useEffect } from "react";
import { useCurrentUser } from "@/hooks/auth/user";
import styles from "./SalesDashboard.module.scss";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// 模擬 API 回傳的利潤資料
const mockProfitData = [
  { month: "1月", revenue: 50000, cost: 30000, profit: 20000 },
  { month: "2月", revenue: 60000, cost: 35000, profit: 25000 },
  { month: "3月", revenue: 45000, cost: 28000, profit: 17000 },
  { month: "4月", revenue: 70000, cost: 40000, profit: 30000 },
  { month: "5月", revenue: 80000, cost: 42000, profit: 38000 },
];

export default function SalesDashboard() {
  const { data: currentUser } = useCurrentUser();
  const vendorId =
    currentUser?.role === "vendor" && "id" in currentUser
      ? currentUser.id
      : undefined;

  const [data, setData] = useState(mockProfitData);

  useEffect(() => {
    // TODO: 這裡可以改成呼叫後端 API，例如 useVendorSales(vendorId)
    setData(mockProfitData);
  }, [vendorId]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 利潤報表</h1>

      <div className={styles.chartSection}>
        <h2 className={styles.subtitle}>每月利潤趨勢</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.chartSection}>
        <h2 className={styles.subtitle}>營收 / 成本 / 利潤</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#8884d8" name="營收" />
            <Bar dataKey="cost" fill="#ff7300" name="成本" />
            <Bar dataKey="profit" fill="#82ca9d" name="利潤" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
