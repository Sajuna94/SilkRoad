import styles from "./VendorList.module.scss";
import VendorCard from "@/components/molecules/VendorCard";
import { InfiniteList } from "@/components/atoms/InfiniteList";
import { useNavigate } from "react-router-dom";

export interface Vendor {
  id: string;
  name: string;
  logoUrl: string;
  description: string | undefined;
}

interface VendorListProps {
  vendors: Vendor[];
}

export default function VendorList({ vendors }: VendorListProps) {
  const navigate = useNavigate();

  const handleVendorClick = (vendorId: string) => {
    console.log(`Maps to vendor: ${vendorId}`);
    navigate(`/vendor/${vendorId}`);
  };

  return (
    <div className={styles.listContainer}>
      <header className={styles.listHeader}>
        <h1>合作店家</h1>
      </header>

      <InfiniteList<Vendor>
        fullItems={vendors}
        pageSize={8} // 一次載入 8 筆
        renderItem={(vendor, index: number) => (
          <VendorCard
            key={vendor.id || index}
            name={vendor.name}
            logoUrl={vendor.logoUrl}
            description={vendor.description}
            onClick={() => handleVendorClick(vendor.id)}
          />
        )}
      />
    </div>
  );
}
