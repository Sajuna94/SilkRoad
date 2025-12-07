import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Dashboard.module.scss";
import OrderTab from "./tabs/Order";
import OverviewTab from "./tabs/Overview";
import ProductTab from "./tabs/Product";

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "1", label: "資訊總覽", element: <OverviewTab /> },
    { id: "2", label: "商品管理", element: <ProductTab /> },
    { id: "3", label: "訂單管理", element: <OrderTab /> },
  ];

  const currentId = location.hash.replace("#", "") || tabs[0].id;

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
        <div className={styles.headerTitle}>Vendor Dashboard</div>
        <ul>
          {tabs.map((t) => (
            <li
              key={t.id}
              onClick={() => navigate(`#${t.id}`)}
              className={`${styles.tabButton} ${
                currentId === t.id ? "active" : ""
              }`}
            >
              {t.label}
            </li>
          ))}
        </ul>
      </aside>

      <main className={styles.main}>
        {tabs.find((t) => t.id === currentId)?.element ?? null}
      </main>
    </div>

    // <div className={styles["container"]}>
    //   <aside>
    //     <ul>
    //       {tabs.map((t) => (
    //         <li key={t.id} onClick={() => navigate(`#${t.id}`)}>
    //           {t.label}
    //         </li>
    //       ))}
    //     </ul>
    //   </aside>

    //   <main>{tabs.find((t) => t.id === currentId)?.element ?? null}</main>
    // </div>
  );
}
