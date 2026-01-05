import { useMemo, useState } from "react";
import VendorList, {
  type Vendor as BaseVendor,
} from "@/components/molecules/VendorList";
import SystemBulletin from "@/components/molecules/SystemBulletin/SystemBulletin";
import {
  useAllAnnouncements,
  type Announcement as ApiAnnouncement,
} from "@/hooks/auth/admin";
import { useVendors } from "@/hooks/auth/vendor";
import type { Announcement as BulletinAnnouncement } from "@/components/molecules/SystemBulletin/AnnouncementModal";
import styles from "./Home.module.scss";
import BlockModal from "@/components/atoms/BlockModal/BlockModal";

type VendorCard = BaseVendor & {
  rating: number;
};

export default function Home() {
  const { data: vendorData, isLoading } = useVendors();
  const { data: apiAnnouncements } = useAllAnnouncements();
  // const logout = useLogout();
  // const user = useCurrentUser().data;

  const vendors: VendorCard[] = useMemo(() => {
    return (
      vendorData?.map((v) => {
        const mockRating = parseFloat(
          (Math.random() * (5 - 3.5) + 3.5).toFixed(1)
        );
        return {
          id: String(v.id),
          name: v.name,
          description: v.description,
          logoUrl:
            v.logo_url ||
            `https://api.dicebear.com/7.x/identicon/svg?seed=${v.id}`, // Fallback to a default if logo_url is not available
          rating: mockRating,
        };
      }) ?? []
    );
  }, [vendorData]);

  const [searchText, setSearchText] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState<number | null>(null);

  const filteredVendors = useMemo(() => {
    return vendors.filter((v) => {
      const matchesSearch =
        searchText === "" ||
        v.name.toLowerCase().includes(searchText.toLowerCase());

      const matchesRating =
        minRatingFilter === null || v.rating >= minRatingFilter;

      return matchesSearch && matchesRating;
    });
  }, [vendors, searchText, minRatingFilter]);

  const announcements: BulletinAnnouncement[] =
    apiAnnouncements?.map((a: ApiAnnouncement) => ({
      id: String(a.id),
      content: a.message,
      adminId: String(a.admin_name),
      createdAt: a.created_at,
    })) ?? [];

  const ratingOptions = [
    { label: "全部", value: null },
    { label: "4.5 ★ 以上", value: 4.5 },
    { label: "4.0 ★ 以上", value: 4.0 },
    { label: "3.5 ★ 以上", value: 3.5 },
  ];

  return (
    <div className={styles.container}>
      <BlockModal />
      <SystemBulletin announcements={announcements} />

      <div className={styles.controlsSection}>
        <div className={styles.searchWrapper}>
          <input
            type="text"
            placeholder="搜尋店家名稱..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          {ratingOptions.map((option) => (
            <button
              key={String(option.value)}
              className={`${styles.filterBtn} ${
                minRatingFilter === option.value ? styles.active : ""
              }`}
              onClick={() => setMinRatingFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <hr className={styles.divider} />

      {isLoading ? (
        <div style={{ textAlign: "center", padding: "2rem" }}>載入中...</div>
      ) : filteredVendors.length > 0 ? (
        <VendorList vendors={filteredVendors} />
      ) : (
        <div className={styles.emptyState}>
          <p>找不到符合條件的店家</p>
          <button
            className={styles.filterBtn}
            onClick={() => {
              setSearchText("");
              setMinRatingFilter(null);
            }}
            style={{ marginTop: "1rem" }}
          >
            清除篩選條件
          </button>
        </div>
      )}
    </div>
  );
}
