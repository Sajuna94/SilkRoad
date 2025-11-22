import styles from './VendorManagement.module.scss';

interface Vendor {
  id: number;
  name: string;
  status: string;
  drinks: number;
}

export default function VendorManagement() {
  const vendors: Vendor[] = [
    { id: 1, name: "honeyTea", status: "Active", drinks: 24 },
    { id: 2, name: "cauliflowerSmoothie", status: "Suspended", drinks: 12 },
  ];

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>商家管理 / Vendor Management</h2>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            <th className={styles.th}>Vendor Name</th>
            <th className={styles.th}>Status</th>
            <th className={styles.th}>Drinks</th>
          </tr>
        </thead>
        <tbody className={styles.tbody}>
          {vendors.map((vendor) => (
            <tr key={vendor.id} className={styles.tr}>
              <td className={styles.td}>{vendor.name}</td>
              <td className={styles.td}>{vendor.status}</td>
              <td className={styles.td}>{vendor.drinks}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
