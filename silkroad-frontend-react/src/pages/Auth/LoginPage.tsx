import LoginForm from "@/components/organisms/LoginForm/LoginForm";
import styles from "./LoginPage.module.css"

export default function LoginPage() {
	// const [isLoading, setIsLoading] = useState(true);

	// // 模擬載入 1 秒後結束
	// useEffect(() => {
	// 	const timer = setTimeout(() => {
	// 		setIsLoading(false);
	// 	}, 1000);
	// 	return () => clearTimeout(timer);
	// }, []);

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
			<div className={styles.page}>
				<div className={styles.background} />
				<div className={styles.centered}>
					<LoginForm />
				</div>
			</div>


			{/* {isLoading ? (
				<>
					<LoadingSkeleton width="100%" height="200px" />
				</>
			) : (
				<AdminDashboard />
			)} */}
		</>
	);
}
