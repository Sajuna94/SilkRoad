import { BrowserRouter, useRoutes } from "react-router-dom";
// import { ToastProvider } from "@/components/atoms/Toast";
import "@/App.css";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import { routes } from "@/router";

import { usePing } from "@/hooks/test/usePing";
// import { CartProvider } from "@/components/molecules/CartConText";

function App() {
	const ping = usePing();
	if (ping.isSuccess) console.log("Backend response:", ping.data);

	return (
		<BrowserRouter basename="/SilkRoad">
			{/* <CartProvider> */}
			<Header />
			{/* <ToastProvider> */}
			<Router />
			{/* </ToastProvider> */}
			<Footer />
			{/* </CartProvider> */}
		</BrowserRouter>
	);
}

function Router() {
	return useRoutes(routes);
}

export default App;
