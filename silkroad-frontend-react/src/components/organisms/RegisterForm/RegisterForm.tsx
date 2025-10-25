import { useState } from "react";
import LabeledInput from "@/components/molecules/LabeledInput/LabeledInput";
import styles from "./RegisterForm.module.css";
import { Link } from "react-router-dom";

export default function RegisterForm() {
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Register:", { name, email, password });
		// TODO: Add registration logic
	};

	return (
		<form className={styles.form} onSubmit={handleSubmit}>
			<h2 className={styles.title}>註冊帳號</h2>

			<LabeledInput
				label="Name"
				value={name}
				onChange={setName}
				required
			/>

			<LabeledInput
				label="Email"
				type="email"
				value={email}
				onChange={setEmail}
				required
			/>

			<LabeledInput
				label="Password"
				type="password"
				value={password}
				onChange={setPassword}
				required
			/>

			<button type="submit" className={styles.button}>
				註冊
			</button>

			<div>
				已有帳號?
				<Link to='/login'> 登入</Link>
			</div>
		</form>
	);
}
