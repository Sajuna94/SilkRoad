import { useState, useEffect } from "react";
import { useCurrentUser, useLogout } from "@/hooks/auth/user";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.scss";

import { type User, UserRole } from "@/types/user";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=";

export default function Profile() {
  const navigate = useNavigate();
  const logout = useLogout();

  const userQuery = useCurrentUser();

  const user = userQuery.data as User;

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
    description: "",
  });

  useEffect(() => {
    if (user) {
      let initialDescription = "";
      let initialAddress = "";

      if (user.role === UserRole.VENDOR) {
        initialDescription = user.description ?? "";
        initialAddress = user.address ?? "";
      } else if (user.role === UserRole.CUSTOMER) {
        initialAddress = user.address ?? "";
      }

      setFormData({
        name: user.name ?? "",
        phone_number: user.phone_number ?? "",
        address: initialAddress,
        description: initialDescription,
      });
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log(`[${user.role}] 儲存資料:`, formData);
    alert("資料已更新 (模擬)");
  };

  const handleBlockedLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => navigate("/home"),
    });
  };

  if (userQuery.isLoading) return <p>Loading...</p>;
  if (!user) return <p>請先登入</p>;

  const isBlocked =
    (user.role === UserRole.VENDOR || user.role === UserRole.CUSTOMER) &&
    user.is_active === false;

  const getAvatarSrc = () => {
    if (user.role === UserRole.VENDOR && user.logo_url) {
      return user.logo_url;
    }
    return `${DEFAULT_AVATAR}${user.name}`;
  };

  return (
    <>
      {isBlocked && (
        <div className={styles.blockedOverlay}>
          <div className={styles.blockedMessage}>
            <h1>帳號已被封鎖</h1>
            <p>您的帳號目前處於停用狀態。如有疑問請聯繫客服。</p>
            <button onClick={handleBlockedLogout}>確認並返回首頁</button>
          </div>
        </div>
      )}

      <section className={styles.profileContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.avatarWrapper}>
            <img src={getAvatarSrc()} alt="Avatar" />
          </div>
          <h2>
            {user.name}{" "}
            {user.role === UserRole.VENDOR && (
              <span style={{ fontSize: "0.8rem", color: "#666" }}>(商家)</span>
            )}
          </h2>

          <div className={styles.formGroup}>
            <label>姓名 / 名稱</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className={styles.formGroup}>
            <label>電話</label>
            <input
              name="phone_number"
              value={formData.phone_number}
              onChange={handleInputChange}
            />
          </div>

          {(user.role === UserRole.CUSTOMER ||
            user.role === UserRole.VENDOR) && (
            <div className={styles.formGroup}>
              <label>地址</label>
              <input
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="請輸入地址"
              />
            </div>
          )}

          {user.role === UserRole.VENDOR && (
            <div className={styles.formGroup}>
              <label>商家描述 (選填)</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="請輸入商家簡介..."
                maxLength={200}
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <div
                style={{
                  textAlign: "right",
                  fontSize: "0.8rem",
                  color: "#888",
                }}
              >
                {formData.description.length} / 200
              </div>
            </div>
          )}

          <button className={styles.saveBtn} onClick={handleSave}>
            儲存修改
          </button>
        </div>

        <div className={styles.rightPanel}>
          <h3>帳戶資訊</h3>
          <div className={styles.infoBlock}>
            <p>
              <strong>ID：</strong> {user.id}
            </p>
            <p>
              <strong>Email：</strong> {user.email}
            </p>
            <p>
              <strong>註冊日期：</strong>{" "}
              {user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <strong>身份：</strong> {user.role.toUpperCase()}
            </p>

            <hr
              style={{
                margin: "15px 0",
                border: "0",
                borderTop: "1px solid #eee",
              }}
            />

            {user.role === UserRole.CUSTOMER && (
              <>
                <p>
                  <strong>會員等級：</strong> Lv. {user.membership_level ?? 0}
                </p>
                <p>
                  <strong>儲值餘額：</strong> ${" "}
                  {user.stored_balance?.toLocaleString() ?? "0"}
                </p>
              </>
            )}

            {user.role === UserRole.VENDOR && (
              <>
                <p>
                  <strong>總營收：</strong> ${" "}
                  {user.revenue?.toLocaleString() ?? "0"}
                </p>
                <p>
                  <strong>帳號狀態：</strong>{" "}
                  {user.is_active ? "營業中" : "停權中"}
                </p>
              </>
            )}

            {user.role === UserRole.ADMIN && (
              <p style={{ color: "red", fontWeight: "bold" }}>
                管理員權限已啟用
              </p>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
