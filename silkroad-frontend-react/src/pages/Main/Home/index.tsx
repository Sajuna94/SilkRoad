import { useMemo } from "react";
import VendorList, {
  type Vendor,
} from "@/components/molecules/VendorList/VendorList";
import SystemBulletin from "@/components/molecules/SystemBulletin/SystemBulletin";
import type { Announcement } from "@/components/molecules/SystemBulletin/AnnouncementModal";

// 假資料生成：店家
const generateMockVendors = (count: number): Vendor[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `v-${i}`,
    name: `SilkRoad 茶飲 No.${i + 1}`,
    logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`,
    description:
      i % 2 === 0 ? "主打新鮮水果茶與特調奶蓋" : "經典珍珠奶茶專賣店",
  }));
};

// 假資料生成：公告
const generateMockAnnouncements = (): Announcement[] => {
  return [
    {
      id: "a-1",
      content:
        "【系統維護】本週日凌晨 02:00 - 04:00 將進行伺服器升級，期間暫停服務，造成不便敬請見諒。",
      adminId: "ADMIN_001",
      createdAt: "2025-12-07 10:00",
    },
    {
      id: "a-2",
      content: "歡慶 SilkRoad 平台上線一週年！全站手搖飲免運費優惠開跑中！",
      adminId: "MKT_Manager",
      createdAt: "2025-12-05 14:30",
    },
    {
      id: "a-3",
      content:
        "請各店家注意：新的食品安全法規將於下個月生效，請至後台查看詳細規範。",
      adminId: "ADMIN_002",
      createdAt: "2025-12-01 09:15",
    },
  ];
};

export default function Home() {
  const mockVendors = useMemo(() => generateMockVendors(30), []);
  // 實際上這裡之後會是 API 呼叫
  const mockAnnouncements = useMemo(() => generateMockAnnouncements(), []);

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
      <SystemBulletin announcements={mockAnnouncements} />
      <hr></hr>
      <VendorList vendors={mockVendors} />
    </div>
  );
}
