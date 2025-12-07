import { useMemo } from "react";
import VendorList, {
  type Vendor,
} from "@/components/molecules/VendorList/VendorList";

// 快速生成假資料的 Helper
const generateMockVendors = (count: number): Vendor[] => {
  return Array.from({ length: count }).map((_, i) => ({
    id: `v-${i}`,
    name: `SilkRoad 茶飲 No.${i + 1}`,
    logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${i}`, // 使用隨機圖像服務
    description:
      i % 2 === 0 ? "主打新鮮水果茶與特調奶蓋" : "經典珍珠奶茶專賣店",
  }));
};

export default function Home() {
  // 使用 useMemo 避免每次 render 都重新產生新陣列
  const mockVendors = useMemo(() => generateMockVendors(30), []);

  return (
    <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
      <VendorList vendors={mockVendors} />
    </div>
  );
}
