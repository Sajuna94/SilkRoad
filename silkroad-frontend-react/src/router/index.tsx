import { useRoutes } from "react-router-dom";
import { AdminDashboardPage } from "@/pages/Admin";
import { AboutPage, AuthPage, CartPage, HomePage } from "@/pages/Main";
import { UserOrdersPage, UserProfilePage, ReviewPage } from "@/pages/User";
import OrderDetail from "@/pages/User/Orders/OrderDetail";
import { VendorDashboardPage, VendorPage } from "@/pages/Vendor";
import { TopUpPage, UserDiscountPage } from "@/pages/Customer";

export const routes = [
  {
    path: "/",
    children: [
      { index: true, element: <AboutPage /> },
      { path: "about", element: <AboutPage /> },
      { path: "login", element: <AuthPage type={"login"} /> },
      { path: "register", element: <AuthPage type={"register"} /> },
      { path: "verify-email", element: <AuthPage type={"verify-email"} /> },
      { path: "forgot-password", element: <AuthPage type={"forgot-password"} /> },
      { path: "cart", element: <CartPage /> },
      { path: "home", element: <HomePage /> },
      { path: "topup", element: <TopUpPage /> },
      {
        path: "admin",
        children: [{ index: true, element: <AdminDashboardPage /> }],
      },
      { path: "orders", element: <UserOrdersPage /> },
      { path: "orders/:orderId", element: <OrderDetail /> },
      { path: "profile", element: <UserProfilePage /> },
      {
        path: "discounts",
        element: <UserDiscountPage />,
      },
      {
        path: "vendor",
        children: [
          { path: ":vendorId", element: <VendorPage /> },
          { path: "dashboard", element: <VendorDashboardPage /> },
          { path: ":vendorId/reviews", element: <ReviewPage /> },
        ],
      },
    ],
  },
];

export default function Router() {
  return useRoutes(routes);
}
