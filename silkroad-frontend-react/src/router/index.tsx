import { useRoutes } from "react-router-dom";
import { AdminDashboard } from "@/pages/Admin";
import { About, Auth, Cart, Home } from "@/pages/Main";
import { UserOrders, UserProfile, ReviewPage } from "@/pages/User";
import OrderDetail from "@/pages/User/Orders/OrderDetail";
import { VendorDashboard, VendorProductList } from "@/pages/Vendor";
import { TopUpPage, UserDiscountPage } from "@/pages/Customer";
import type { DiscountData } from "@/pages/Customer/UserDiscount/UserDiscountPage";

// 模擬折扣碼資料：之後要把它改回 VENDOR ID 再找對應的商家名字
const mockDiscounts: DiscountData[] = [
  {
    id: "1",
    code: "FANFAN520",
    vendor_name: "電風扇專賣店",
    expiry_date: "2024-08-31",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
  {
    id: "2",
    code: "SUMMERISSUMMER",
    vendor_name: "夏天是 SUMMER",
    expiry_date: "2025-08-31",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
  {
    id: "3",
    code: "VIP666",
    vendor_name: "祖國是我的",
    expiry_date: "2026-06-04",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
  {
    id: "4",
    code: "QWER",
    vendor_name: "上下左右 AB",
    expiry_date: "2024-08-31",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
  {
    id: "5",
    code: "CLIU",
    vendor_name: "資料庫賣肝自治區",
    expiry_date: "2026-01-07",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
  {
    id: "6",
    code: "GG",
    vendor_name: "Gs0nbigjj",
    expiry_date: "2024-08-31",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
  {
    id: "7",
    code: "ONEPIECE",
    vendor_name: "寶藏在這裡",
    expiry_date: "2024-08-31",
    type: "PERCENTAGE",
    value: 20,
    min_purchase: "1000",
    max_discount: "200",
    membership_limit: "ALL",
  },
];

export const routes = [
  {
    path: "/",
    children: [
      { index: true, element: <About /> },
      { path: "about", element: <About /> },
      { path: "login", element: <Auth type={"login"} /> },
      { path: "register", element: <Auth type={"register"} /> },
      { path: "cart", element: <Cart /> },
      { path: "home", element: <Home /> },
      { path: "topup", element: <TopUpPage /> },
      {
        path: "admin",
        children: [{ index: true, element: <AdminDashboard /> }],
      },
      { path: "orders", element: <UserOrders /> },
      { path: "orders/:orderId", element: <OrderDetail /> },
      { path: "profile", element: <UserProfile /> },
      {
        path: "discounts",
        element: <UserDiscountPage discounts={mockDiscounts} />,
      },
      {
        path: "vendor",
        children: [
          { path: ":vendorId", element: <VendorProductList /> },
          { path: "dashboard", element: <VendorDashboard /> },
          { path: ":vendorId/reviews", element: <ReviewPage /> },
        ],
      },
    ],
  },
];

export default function Router() {
  return useRoutes(routes);
}
