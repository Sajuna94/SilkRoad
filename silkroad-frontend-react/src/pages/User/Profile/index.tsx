import { useState, useEffect } from "react";
import { useCurrentUser, useLogout } from "@/hooks/auth/user";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.scss";

// 預設頭像 API
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=";

export default function Profile() {
  const navigate = useNavigate();
  const { data: user, isLoading } = useCurrentUser();
  const logout = useLogout();

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phone_number: user.phone_number || "",
        address: "林森北路123號4樓",
        // 之後有地址添加回來
        // address: user.address || "",
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log("儲存資料:", formData);
    alert("資料已更新 (模擬)");
  };

  const handleBlockedLogout = () => {
    // 登出並清除快取
    logout.mutate(undefined, {
      onSuccess: () => {
        navigate("/home"); // 跳轉回首頁
      },
    });
  };

  if (isLoading) return <p>Loading...</p>;
  if (!user) return <p>請先登入</p>;

  // 檢查封鎖狀態 (假設 user.status 存在，或是你可以手動設為 'blocked' 來測試效果)
  // const isBlocked = user.status === 'blocked';
  // 測試用：可以把下面這行取消註解來看看封鎖效果
  const isBlocked = false;

  return (
    <>
      {isBlocked && (
        <div className={styles.blockedOverlay}>
          <div className={styles.blockedMessage}>
            <h1>帳號已被封鎖</h1>
            <p>您的帳號因違反使用條款目前處於停用狀態。如有疑問請聯繫客服。</p>
            <button onClick={handleBlockedLogout}>確認並返回首頁</button>
          </div>
        </div>
      )}

      <section className={styles.profileContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.avatarWrapper}>
            <img src={`${DEFAULT_AVATAR}${user.name}`} alt="Avatar" />
          </div>
          <h2>{user.name}</h2>

          <div className={styles.formGroup}>
            <label>姓名</label>
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

          <div className={styles.formGroup}>
            <label>地址</label>
            <input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              placeholder="尚未設定地址"
            />
          </div>

          <button className={styles.saveBtn} onClick={handleSave}>
            儲存修改
          </button>
        </div>

        <div className={styles.rightPanel}>
          <h3>帳戶狀態與操作</h3>
          <div className={styles.infoBlock}>
            <p>
              <strong>會員編號：</strong> {user.id}
            </p>
            <p>
              <strong>註冊日期：</strong> {user.created_at}
            </p>
            <p>
              <strong>Email：</strong> {user.email}
            </p>
            <p>
              <strong>目前身份：</strong> {user.role}
            </p>
            <br />
            <p>
              在此區域，您可以查看您的帳戶活動摘要，或是進行進階設定（例如變更密碼、綁定社群帳號等）。
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
