import {
	AboutPage,
	CartPage,
	HomePage,
	LoginPage,
	RegisterPage,
	OrderHistoryPage,
} from "@/pages";
import AdminDashboard from "@/pages/Admin/AdminDashboard";
import VendorProductList from "@/pages/Vendor/VendorProductList";
import VendorDashboard from "@/pages/Vendor/Dashboard";

export const routes = [
	{ path: "/cart", element: <CartPage /> },
	{ path: "/orders", element: <OrderHistoryPage /> },

	{
		path: "/",
		children: [
			{ index: true, element: <AboutPage /> },
			{ path: "about", element: <AboutPage /> },
			{ path: "home", element: <HomePage /> },
		],
	},
	{
		path: "/",
		children: [
			{ path: "login", element: <LoginPage /> },
			{ path: "register", element: <RegisterPage /> },
		],
	},
	{
		path: "/vendor",
		children: [
			{ index: true, element: <VendorProductList /> },   // /vendor
			{ path: "dashboard", element: <VendorDashboard /> } // /vendor/dashboard
		],
	},
	{ path: "/admin", element: <AdminDashboard /> },
];