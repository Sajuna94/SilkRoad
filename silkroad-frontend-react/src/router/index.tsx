import AdminDashboard from "@/pages/Admin/AdminDashboard";
import { useRoutes } from "react-router-dom";
import CartPage from "@/pages/Store/CartPage";
import OrderHistoryPage from "@/pages/OrderHistoryPage";
import AboutPage from "@/pages/Main/AboutPage";
import HomePage from "@/pages/Main/HomePage";
import { UserLoginPage, UserRegisterPage } from "@/pages/User";
import { VendorDashboradPage, VendorProductListPage } from "@/pages/Vendor";

export const routes = [
	{ path: "/cart", element: <CartPage /> },
	{ path: "/orders", element: <OrderHistoryPage /> },

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
}