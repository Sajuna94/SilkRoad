import styles from "./Auth.module.scss"
import { useState } from "react";
import LabeledInput from "@/components/molecules/LabeledInput/LabeledInput";
import { Link } from "react-router-dom";

export default function LoginPage() {
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

	const [form, setForm] = useState({
		email: "", password: ""
	})

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Login:", form);
		// TODO: Add login logic
	};

	return (
		<>
			<div className={styles['background']}></div>
			<div className={styles['centered']}>
				<form className={styles['form']} onSubmit={handleSubmit}>
					<h2 className={styles['title']}>登入帳號</h2>

					<LabeledInput
						label="Email"
						type="email"
						value={form.email}
						onChange={(value) => setForm({ ...form, email: value })}
						required
					/>

					<LabeledInput
						label="Password"
						type="password"
						value={form.password}
						onChange={(value) => setForm({ ...form, password: value })}
						required
					/>

					<button type="submit" className={styles['button']}>
						登入
					</button>

					<div className={styles['footer']}>
						尚未註冊?
						<Link to="/register"> 建立帳號</Link>
					</div>
				</form>
			</div>
		</>
	);
}
