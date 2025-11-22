import { Routes, Route } from "react-router-dom";
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
import VendorDashboard from "@/pages/Vendor/VendorDashboard";

export default function Router() {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />

            <Route>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrderHistoryPage></OrderHistoryPage>} />

            <Route>
                <Route path="/vendor" element={<VendorProductList />} />
                <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            </Route>
            <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
    );
}
