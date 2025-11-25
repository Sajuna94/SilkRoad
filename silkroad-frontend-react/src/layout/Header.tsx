import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { type User } from "@/types/user"



export default function Header() {

    const user: User = {
        id: 2,
        name: "test",
        email: "test@gmail.com",
        phone_number: "2222",
        role: "admin",
        created_at: "22020/22/22"
    };


    return (
        <header className={styles['header-warp']}>
            <h1>
                <Link to="/home">SilkRoad</Link>
            </h1>
            <nav>
                <ul>
                    <li><Link to="/about">關於我們</Link></li>
                    <li><Link to="/vendor">Vendor</Link></li>
                </ul>
                <ul>
                    {user.role === "admin" && (
                        <li><Link to="/admin">Admin</Link></li>
                    )}
                    <li><Link to="/user/orders">訂單紀錄</Link></li>
                    <li><Link to="/cart">查看購物車</Link></li>
                    <li><Link to="/login">登入</Link></li>
                </ul>
            </nav>
            {/* <div className={styles['left']}>
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
            </nav> */}
        </header>
    );
}
