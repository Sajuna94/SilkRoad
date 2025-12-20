import { Link } from "react-router-dom";
import styles from "./Header.module.scss";
import { useCurrentUser, useLogout } from "@/hooks/auth/user";

export default function Header() {
    const logout = useLogout();

    const { data: user } = useCurrentUser();

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
                    {/* {user.role === "admin" && (
                        <li><Link to="/admin">Admin</Link></li>
                    )} */}
                    <li><Link to="/user/orders">訂單紀錄</Link></li>
                    <li><Link to="/cart">查看購物車</Link></li>

                    {user ? (
                        <li onClick={() => { logout.mutate(); }}><a>登出</a></li>
                    ) : (
                        <li><Link to="/login">登入</Link></li>
                    )}
                </ul>
            </nav>
        </header>
    );
}
