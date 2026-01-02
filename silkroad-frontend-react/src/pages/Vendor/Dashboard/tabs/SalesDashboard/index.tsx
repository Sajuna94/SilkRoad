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
  const [topDrinks, setTopDrinks] = useState<any[]>([]);

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

        const weekly = json.weekly || [];

        const chartData = weekly.map((w: any) => {
          const label = w.week_label || `${w.year}-W${w.week}`;
          const revenue = w.net_revenue ?? w.gross_revenue ?? 0;
          return { week: label, revenue };
        });

        setData(chartData);
        setTopDrinks(json.top_drinks || []);
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
      <h1 className={styles.title}>利潤報表</h1>

      {loading ? (
        <div className={styles.loading} style={{ color: "black" }}>載入中...</div>
      ) : error ? (
        <div className={styles.error} style={{ color: "black" }}>錯誤: {error}</div>
      ) : data.length === 0 ? (
        <div className={styles.noData} style={{ color: "black" }}>目前尚無銷售資料</div>
      ) : (
        <>
          <div className={styles.chartSection}>
            <h2 className={styles.subtitle}>每週利潤趨勢</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
              <div className={styles.chartSection}>
                <h2 className={styles.subtitle}>銷量最高的飲品</h2>
                {topDrinks.length === 0 ? (
                  <div>目前沒有銷售紀錄</div>
                ) : (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topDrinks} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="product_name" type="category" />
                      <Tooltip />
                      <Bar dataKey="quantity" fill="#8884d8" name="數量" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
        </>
      )}
      
    </div>
  );
}
