import { Navigate, useRoutes } from "react-router-dom";
import { AdminDashboard } from "@/pages/Admin";
import { About, Auth, Cart, Home } from "@/pages/Main";
import { UserOrders, UserProfile } from "@/pages/User";
import { VendorDashboard, VendorProductList } from "@/pages/Vendor";

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
      {
        path: "admin",
        children: [{ index: true, element: <AdminDashboard /> }],
      },
      {
        path: "user",
        children: [
          { index: true, element: <Navigate to="profile" replace /> },
          { path: "orders", element: <UserOrders /> },
          { path: "profile", element: <UserProfile /> },
        ],
      },
      {
        path: "vendor",
        children: [
          { index: true, element: <VendorProductList /> },
          { path: "dashboard", element: <VendorDashboard /> },
        ],
      },
    ],
  },
];

export default function Router() {
  return useRoutes(routes);
}
