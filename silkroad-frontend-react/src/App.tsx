import { BrowserRouter } from "react-router-dom";
import { ToastProvider } from "@/components/Toast";
import "@/App.css";
import Header from "@/layout/Header";
import Footer from "@/layout/Footer";
import Router from "@/router";

import { useEffect } from "react";
import axios from "axios";

function App() {
	useEffect(() => {
		axios.get("/api/ping")
			.then(res => console.log("Backend response:", res.data.message))
			.catch(err => console.log("Error:", err.message));
	}, []);

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
