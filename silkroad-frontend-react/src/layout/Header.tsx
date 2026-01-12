import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { UserRole } from "@/types/user";
import { useLogout, useCurrentUser } from "@/hooks/auth/user";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=";

export default function Header() {
  const logout = useLogout();
  const navigate = useNavigate();
  const { data: user } = useCurrentUser();

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

  const getAvatarUrl = () => {
    if (!user) return DEFAULT_AVATAR;

    // Vendor 使用 logo_url，如果有的話
    if (user.role === UserRole.VENDOR && user.logo_url) {
      return user.logo_url;
    }

    // 其他角色或沒有 logo 的 vendor 使用預設頭像
    return `${DEFAULT_AVATAR}${user.name}`;
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
          {(!user || user.role === "customer") && (
            <li>
              <Link to="/cart">查看購物車</Link>
            </li>
          )}

          {user && user.role === "customer" && (
            <li>
              <Link to="/discounts">查看折扣券</Link>
            </li>
          )}

          {user && user.role === "vendor" && (
            <li>
              <Link to={`/vendor/${user.id}/reviews`}>查看評論</Link>
            </li>
          )}
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
                <img src={getAvatarUrl()} alt={user.name} />
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

                  {user.role === "customer" && (
                    <Link
                      to="/orders"
                      className={styles.menuItem}
                      onClick={handleLinkClick}
                    >
                      我的訂單
                    </Link>
                  )}

                  {user.role === "customer" && (
                    <Link
                      to="/topup"
                      className={styles.menuItem}
                      onClick={handleLinkClick}
                    >
                      儲值中心
                    </Link>
                  )}

                  <Link
                    to="/profile"
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
