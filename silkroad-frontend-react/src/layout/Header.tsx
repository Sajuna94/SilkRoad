import { Link } from "react-router-dom";
import styles from "./Header.module.scss";

export default function Header() {
    return (
        <header className={styles['navbar']}>
            <div className={styles['left']}>
                <div className={styles['logo']}>
                    <Link to="/home">SilkRoad</Link>
                </div>
                <nav className={styles['links']}>
                    <Link to="/about">關於我們</Link>
                </nav>
                <nav className={styles['links']}>
                    <Link to="/admin">Admin</Link>
                    <Link to="/vendor">Vendor</Link>
                </nav>
            </div>
            <nav className={styles['right']}>
                <Link to="/cart">購物車</Link>
                <Link to="/user/orders">查看訂單</Link>
                <Link to="/login">登入</Link>
            </nav>
        </header>
    );
}
