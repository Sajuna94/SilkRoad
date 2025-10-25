import { useState } from "react";
import styles from "./Input.module.css";
import hide from "@/assets/icons/hide.png"
import show from "@/assets/icons/show.png"

interface InputProps {
	label: string;
	type?: "text" | "email" | "password";
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
	error?: string;
}

export default function Input({
	label,
	type = "text",
	value,
	onChange,
	required = false,
	error,
}: InputProps) {
	const [showPassword, setShowPassword] = useState(false);
	const isPassword = type === "password";

	return (
		<div className={`${styles.field} ${value ? styles.filled : ""} ${error ? styles.error : ""}`}>
			<input
				type={isPassword && showPassword ? "text" : type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={""}
				required={required}
				className={styles.input}
			/>
			<label className={styles.label}>{label}</label>

			{isPassword && (
				<button
					type="button"
					className={styles.toggle}
					onClick={() => setShowPassword((prev) => !prev)}
				>
					<img
						src={showPassword ? show : hide}
						width={18}
						height={18}
					/>
				</button>
			)}

			{error && <div className={styles.message}>{error}</div>}
		</div>
	);
}
