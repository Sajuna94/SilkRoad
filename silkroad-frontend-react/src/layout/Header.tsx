import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
// import { type User } from "@/types/user";
// import { useQueryClient } from "@tanstack/react-query";
import { useLogout, useCurrentUser } from "@/hooks/auth/user";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=";

export default function Header() {
  // const user: User = {
  //     id: 2,
  //     name: "test",
  //     email: "test@gmail.com",
  //     phone_number: "2222",
  //     role: "admin",
  //     created_at: "22020/22/22"
  // };

  //   const qc = useQueryClient();
  //   const user = qc.getQueryData<User>(["user"]);
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();
  // if (!user) {
  // logout
  // }

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    logout.mutate();
    setIsMenuOpen(false);
    navigate("/home");
  };

  return (
    <header className={styles["header-warp"]}>
      <h1>
        <Link to="/home">SilkRoad</Link>
      </h1>
      <nav>
        <ul>
          <li>
            <Link to="/about">關於我們</Link>
          </li>
          <li>
            <Link to="/vendor">Vendor</Link>
          </li>
          <li>
            <Link to="/cart">查看購物車</Link>
          </li>
        </ul>
        <ul className={styles.authSection}>
          {!user ? (
            // 未登入
            <li>
              <Link to="/login">登入</Link>
            </li>
          ) : (
            // 已登入：顯示頭像與下拉選單
            // 綁定 ref 以偵測點擊範圍
            <div className={styles.userMenuContainer} ref={menuRef}>
              <div
                className={styles.avatarCircle}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <img src={`${DEFAULT_AVATAR}${user.name}`} alt={user.name} />
              </div>

              {isMenuOpen && (
                <div className={styles.dropdownMenu}>
                  <div className={styles.userInfo}>
                    <div className={styles.userName}>{user.name}</div>
                    <div className={styles.userEmail}>{user.email}</div>
                  </div>

                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className={styles.menuItem}
                      onClick={handleLinkClick}
                    >
                      管理員後臺
                    </Link>
                  )}

                  {user.role === "vendor" && (
                    <Link
                      to="/vendor/dashboard"
                      className={styles.menuItem}
                      onClick={handleLinkClick}
                    >
                      商家後臺
                    </Link>
                  )}

                  <Link
                    to="/user/orders"
                    className={styles.menuItem}
                    onClick={handleLinkClick}
                  >
                    我的訂單
                  </Link>

                  <Link
                    to="/user/profile"
                    className={styles.menuItem}
                    onClick={handleLinkClick}
                  >
                    個人資料設定
                  </Link>

                  <div
                    className={`${styles.menuItem} ${styles.logoutBtn}`}
                    onClick={handleLogout}
                  >
                    登出
                  </div>
                </div>
              )}
            </div>
          )}
        </ul>
      </nav>
    </header>
  );
}
