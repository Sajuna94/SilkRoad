import { useNavigate, useLocation } from "react-router-dom";
import styles from "./Dashboard.module.scss";
import OrderTab from "./tabs/OrderManagement";
import ProductTab from "./tabs/ProductManagement";
import DiscountManagement from "./tabs/DiscountManagement";
import SalesDashboard from "./tabs/SalesDashboard";
import BlockModal from "@/components/atoms/BlockModal/BlockModal";

export default function VendorDashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "1", label: "折扣管理", element: <DiscountManagement /> },
    { id: "2", label: "商品管理", element: <ProductTab /> },
    { id: "3", label: "訂單管理", element: <OrderTab /> },
    { id: "4", label: "利潤報表", element: <SalesDashboard /> },
  ];

  const currentId = location.hash.replace("#", "") || tabs[0].id;

  return (
    <div className={styles.dashboard}>
      <BlockModal />
      <aside className={styles.sidebar}>
        <div className={styles.headerTitle}>Vendor Dashboard</div>
        <ul>
          {tabs.map((t) => (
            <li
              key={t.id}
              onClick={() => navigate(`#${t.id}`)}
              className={`${styles.tabButton} ${
                currentId === t.id ? styles.active : ""
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
