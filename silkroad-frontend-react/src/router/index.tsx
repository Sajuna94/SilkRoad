import { useRoutes } from "react-router-dom";
import { AdminDashboard } from "@/pages/Admin";
import { About, AuthLogin, AuthRegister, Cart, Home } from "@/pages/Main";
import { UserOrders } from "@/pages/User";
import { VendorDashboard, VendorProductList } from "@/pages/Vendor";

export const routes = [
  {
    path: "/",
    children: [
<<<<<<< HEAD
        { index: true, element: <About /> },
        { path: "about", element: <About /> },
        { path: "login", element: <AuthLogin /> },
        { path: "register", element: <AuthRegister /> },
        { path: "cart", element: <Cart /> },
        { path: "home", element: <Home /> },
        {
            path: "admin",
            children: [
                { index: true, element: <AdminDashboard /> },
            ],
        },
        {
            path: "user",
            children: [
                { path: "orders", element: <UserOrders /> },
            ],
        },
        {
            path: "vendor",
            children: [
                { index: true, element: <VendorProductList /> },
                { path: "dashboard", element: <VendorDashboard /> },
            ],
        },
    ]
}];

export default function Router() {
    return useRoutes(routes);
}
=======
      { index: true, element: <About /> },
      { path: "about", element: <About /> },
      { path: "login", element: <AuthLogin /> },
      { path: "register", element: <AuthRegister /> },
      { path: "cart", element: <Cart /> },
      { path: "home", element: <Home /> },
      {
        path: "admin",
        children: [{ index: true, element: <AdminDashboard /> }],
      },
      {
        path: "user",
        children: [{ path: "orders", element: <UserOrders /> }],
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
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a
