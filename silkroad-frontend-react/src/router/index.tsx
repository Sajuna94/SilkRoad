<<<<<<< HEAD
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import { useRoutes } from "react-router-dom";
import CartPage from "@/pages/Store/CartPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import AboutPage from "@/pages/Main/AboutPage";
import HomePage from "@/pages/Main/HomePage";
import { UserLoginPage, UserRegisterPage } from "@/pages/User";
import { VendorDashboradPage, VendorProductListPage } from "@/pages/Vendor";
=======
import { useRoutes } from "react-router-dom";
import { AdminDashboard } from "@/pages/Admin";
import { About, AuthLogin, AuthRegister, Cart, Home } from "@/pages/Main";
import { UserOrders } from "@/pages/User";
import { VendorDashboard, VendorProductList } from "@/pages/Vendor";
>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374

export const routes = [{
    path: "/",
    children: [
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

<<<<<<< HEAD
	{
		path: "/",
		children: [
			{ index: true, element: <AboutPage /> },
			{ path: "about", element: <AboutPage /> },
			{ path: "home", element: <HomePage /> },
			{ path: "login", element: <UserLoginPage /> },
			{ path: "register", element: <UserRegisterPage /> },
		],
	},
	{
		path: "/vendor",
		children: [
			{ index: true, element: <VendorProductListPage /> },   // /vendor
			{ path: "dashboard", element: <VendorDashboradPage /> } // /vendor/dashboard
		],
	},
	{ path: "/admin", element: <AdminDashboard /> },
];

export default function Router() {
	return useRoutes(routes);
=======
export default function Router() {
    return useRoutes(routes);
>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374
}