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
                <Link to="/about">About</Link>
                <Link to="/login">Login</Link>
            </nav>
        </header>
    );
}
