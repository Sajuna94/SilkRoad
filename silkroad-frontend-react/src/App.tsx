import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/Toast";
import "@/App.css";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import Router from "@/router";

import { usePing } from "@/hooks/test/usePing";

function App() {
	const ping = usePing();
	if (ping.isSuccess)
		console.log("Backend response:", ping.data);

	return (
		<ToastProvider>
			<BrowserRouter basename="/SilkRoad">
				<Header />
				<Router />
				<Footer />
			</BrowserRouter>
		</ToastProvider>
	);
}

export default App;
