import styles from "./RegisterPage.module.css";
import RegisterForm from "@/components/organisms/RegisterForm/RegisterForm";

export default function RegisterPage() {
	return (
		<>
			<div className={styles.page}>
				<div className={styles.background} />
				<div className={styles.centered}>
					<RegisterForm />
				</div>
			</div>
		</>
	);
}
