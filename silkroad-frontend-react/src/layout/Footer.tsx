import styles from "@/layout/Footer.module.css";
import { Link } from "react-router-dom";

export default function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.container}>
				<div className={styles.left}>
					© {new Date().getFullYear()} SilkRoad. All rights reserved.
				</div>

				<div className={styles.right}>
					<div className={styles.brand}>SilkRoad</div>
					<nav className={styles.links}>
						<Link to="/terms">Terms</Link>
						<Link to="/privacy">Privacy</Link>
						<a href="https://github.com" target="_blank" rel="noopener noreferrer">
							GitHub
						</a>
					</nav>
				</div>
			</div>
		</footer>
	);
}
