import { useNavigate, useLocation } from "react-router-dom";
<<<<<<< HEAD
import styles from "./Dashboard.module.scss"
=======
import styles from "./Dashboard.module.scss";
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a
import OrderTab from "./tabs/Order";
import OverviewTab from "./tabs/Overview";
import ProductTab from "./tabs/Product";

export default function VendorDashboardPage() {
<<<<<<< HEAD
	const navigate = useNavigate();
	const location = useLocation();
=======
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "1", label: "資訊總覽", element: <OverviewTab /> },
    { id: "2", label: "商品管理", element: <ProductTab /> },
    { id: "3", label: "訂單管理", element: <OrderTab /> },
  ];
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a

  const currentId = location.hash.replace("#", "") || tabs[0].id;

  return (
    <div className={styles.dashboard}>
      <aside className={styles.sidebar}>
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
