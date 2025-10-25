import { useState } from "react";
import Input from "@/components/atoms/Input/Input";
import styles from "./LoginForm.module.css";
import { Link } from "react-router-dom";

export default function LoginForm() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Login:", { email, password });
		// TODO: Add login logic
	};

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h2 className={styles.title}>登入帳號</h2>

			<Input
				label="Email"
				type="email"
				value={email}
				onChange={setEmail}
				required
			/>

			<Input
				label="Password"
				type="password"
				value={password}
				onChange={setPassword}
				required
			/>

			<button type="submit" className={styles.button}>
				登入
			</button>

			<div className={styles.footer}>
				尚未註冊？
				<Link to="/register">建立帳號</Link>
			</div>
		</form>
	);
}
