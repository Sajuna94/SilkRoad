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
  const [granularity, setGranularity] = useState<'daily'|'weekly'|'monthly'|'yearly'>('weekly');
  const [seriesMap, setSeriesMap] = useState<Record<string, any[]>>({});

  useEffect(() => {
    // Prefetch all granularities so toggles are instant
    if (!vendorId) {
      setLoading(false);
      setData([]);
      return;
    }

    const granularities = ['daily','weekly','monthly','yearly'] as const;
    setLoading(true);
    setError(null);

    const fetchAll = async () => {
      try {
        const results: Record<string, any[]> = {};
        let anyTop: any[] = [];
        let hadSuccess = false;

        await Promise.all(granularities.map(async (g) => {
          try {
            const res = await fetch(`/api/vendor/${vendorId}/sales_summary?granularity=${g}`, { credentials: 'include' });
            if (!res.ok) return;
            const json = await res.json();
            if (!json || !json.success) return;
            hadSuccess = true;
            const series = json.series || [];
            results[g] = series.map((s: any) => ({ label: s.label, revenue: s.net_revenue ?? s.gross_revenue ?? s.revenue ?? 0 }));
            if (!anyTop.length && Array.isArray(json.top_drinks)) anyTop = json.top_drinks;
          } catch (e) {
            console.error('fetch for granularity failed', g, e);
          }
        }));

        setSeriesMap(results);
        setTopDrinks(anyTop);
        setData(results[granularity] ?? []);
        if (!hadSuccess) setError('No data available');
        setLoading(false);
      } catch (err) {
        console.error('fetchAll error', err);
        setError(String(err));
        setLoading(false);
      }
    };

    fetchAll();
  }, [vendorId]);

  // update displayed data when user toggles granularity (uses cached seriesMap)
  useEffect(() => {
    if (seriesMap && seriesMap[granularity]) {
      setData(seriesMap[granularity]);
    }
  }, [granularity, seriesMap]);

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
          <div className={styles.controls}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              {(['daily','weekly','monthly','yearly'] as const).map(g => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: g === granularity ? '2px solid #4caf50' : '1px solid #ccc',
                    background: g === granularity ? '#e8f5e9' : '#fff',
                    cursor: 'pointer',
                    color: 'black',
                  }}
                >
                  {g.charAt(0).toUpperCase() + g.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.chartSection}>
            <h2 className={styles.subtitle}>{`${granularity.charAt(0).toUpperCase() + granularity.slice(1)} 利潤趨勢`}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="label" />
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
