import { useNavigate } from "react-router-dom";
import styles from "./BlockModal.module.scss";
import { useCurrentUser, useLogout } from "@/hooks/auth/user";
import { UserRole } from "@/types/user";

export default function BlockModal() {
  const logout = useLogout();
  const user = useCurrentUser().data;

  const handleBlockedLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => useNavigate()("/home"),
    });
  };

  const isBlocked =
    user &&
    (user.role === UserRole.VENDOR || user.role === UserRole.CUSTOMER) &&
    user.is_active === false;

  if (!isBlocked) {
    return null;
  }

  return (
    <div className={styles.blockedOverlay}>
      <div className={styles.blockedMessage}>
        <h1>帳號已被封鎖</h1>
        <p>您的帳號目前處於停用狀態。如有疑問請聯繫客服。</p>
        <button onClick={handleBlockedLogout}>確認並返回首頁</button>
      </div>
    </div>
  );
}
