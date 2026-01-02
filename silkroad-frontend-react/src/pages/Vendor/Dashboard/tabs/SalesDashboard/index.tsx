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

export default function SalesDashboard() {
  const { data: currentUser } = useCurrentUser();
  const vendorId =
    currentUser?.role === "vendor" && "id" in currentUser
      ? currentUser.id
      : undefined;

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const COST_RATIO = 0.6; // default estimated cost as 60% of revenue

  useEffect(() => {
    // fetch backend sales summary and compute profit using an estimated cost ratio
    if (!vendorId) {
      setLoading(false);
      setData([]);
      return;
    }

    const fetchSales = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/vendor/${vendorId}/sales_summary`, { credentials: 'include' });
        if (!res.ok) {
          setError('Fetch failed');
          setData([]);
          setLoading(false);
          return;
        }
        const json = await res.json();
        if (!json.success) {
          setError(json.message || 'No data');
          setData([]);
          setLoading(false);
          return;
        }

        const monthly = json.monthly || [];

        const chartData = monthly.map((m: any) => {
          const monthLabel = `${m.month}月`;
          const revenue = m.revenue ?? m.gross_revenue ?? 0;
          const cost = m.cost_estimate ?? Math.round(revenue * COST_RATIO);
          const profit = m.profit ?? (revenue - (m.discount || 0) - cost);
          return { month: monthLabel, revenue, cost, profit };
        });

        setData(chartData);
        setLoading(false);
      } catch (err) {
        console.error('fetchSales error', err);
        setError(String(err));
        setData([]);
        setLoading(false);
      }
    };

    fetchSales();
  }, [vendorId]);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 利潤報表</h1>

      {loading ? (
        <div className={styles.loading} style={{ color: "black" }}>載入中...</div>
      ) : error ? (
        <div className={styles.error} style={{ color: "black" }}>錯誤: {error}</div>
      ) : data.length === 0 ? (
        <div className={styles.noData} style={{ color: "black" }}>目前尚無銷售資料</div>
      ) : (
        <>
          <div className={styles.chartSection}>
            <h2 className={styles.subtitle}>每月利潤趨勢</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="month"/>
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="profit" stroke="#82ca9d"/>
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
        </>
      )}
      
    </div>
  );
}
