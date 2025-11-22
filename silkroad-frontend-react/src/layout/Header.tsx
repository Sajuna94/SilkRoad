import { Link } from "react-router-dom";
import styles from "./Header.module.css";

export default function Header() {
	return (
		<header className={styles.navbar}>
			<div className={styles.navbarLogo}>
				<Link to="/">SilkRoad</Link>
			</div>
			<nav className={styles.navbarLinks}>
				<Link to="/">Home</Link>
				<Link to="/cart">Cart</Link>
				<Link to="/orders">Order</Link>
				<Link to="/about">About</Link>
				<Link to="/login">Login</Link>
				<Link to="/admin">Admin</Link>
				<Link to="/vendor">Vendor</Link>
			</nav>
		</header>
	);
}
