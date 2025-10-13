import { useState, useEffect } from "react";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import AdminDashboard from "./Admin/AdminDashboard";

export default function LoginPage() {
	const [isLoading, setIsLoading] = useState(true);

	// 模擬載入 1 秒後結束
	useEffect(() => {
		const timer = setTimeout(() => {
			setIsLoading(false);
		}, 1000);
		return () => clearTimeout(timer);
	}, []);

	//   將來要接後端 API，例如登入、取得資料，可以這樣搭配使用
	//   useEffect(() => {
	//   async function fetchData() {
	//     try {
	//       const res = await fetch("/api/admin/dashboard");
	//       const data = await res.json();
	//       // 處理 data...
	//     } finally {
	//       setIsLoading(false);
	//     }
	//   }
	//   fetchData();
	// }, []);

	return (
		<>
			<h1>Login Page</h1>
			{isLoading ? (
				<>
					<LoadingSkeleton width="100%" height="200px" />
				</>
			) : (
				<AdminDashboard />
			)}
		</>
	);
}
