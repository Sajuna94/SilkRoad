import { useRoutes } from "react-router-dom";
import { AdminDashboard } from "@/pages/Admin";
import { About, Auth, Cart, Home } from "@/pages/Main";
import { UserOrders, UserProfile, ReviewPage } from "@/pages/User";
import { VendorDashboard, VendorProductList } from "@/pages/Vendor";
import { TopUpPage } from "@/pages/Customer";

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
      { path: "profile", element: <UserProfile /> },
      {
        path: "vendor",
        children: [
          { path: ":vendorId", element: <VendorProductList /> },
          { path: "dashboard", element: <VendorDashboard /> },
          { path: "reviews", element: <ReviewPage /> },
        ],
      },
    ],
  },
];

export default function Router() {
  return useRoutes(routes);
}
