import { useState, useEffect } from "react";
import { useCurrentUser, useLogout, useUpdateUser } from "@/hooks/auth/user";
import { useUpdateVendorDescription, useUpdateVendorManagerInfo } from "@/hooks/auth/vendor";
import { useNavigate } from "react-router-dom";
import styles from "./Profile.module.scss";

import { type User, UserRole } from "@/types/user";

const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&color=fff&name=";

export default function Profile() {
  const navigate = useNavigate();
  const logout = useLogout();

  const userQuery = useCurrentUser();
  const updateUserMutation = useUpdateUser();
  const updateVendorDescMutation = useUpdateVendorDescription();
  const updateVendorManagerMutation = useUpdateVendorManagerInfo();

  const user = userQuery.data;

  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    address: "",
  });

const [vendorDesc, setVendorDesc] = useState("");

const [managerForm, setManagerForm] = useState({
  name: "",
  email: "",
  phone_number: "",
});

const [logoFile, setLogoFile] = useState<File | null>(null);
const [logoPreview, setLogoPreview] = useState<string | null>(null);
	

useEffect(() => {
 	if (!user) return;

  	setFormData({
    	name: user.name ?? "",
    	phone_number: user.phone_number ?? "",
    	address:
      		user.role === UserRole.CUSTOMER || user.role === UserRole.VENDOR
        	? user.address ?? ""
        	: "",
  	});

	if (user?.role === UserRole.VENDOR) {
 		setVendorDesc(user.description ?? "");
		setManagerForm({
      name: user.vendor_manager?.name ?? "",
      email: user.vendor_manager?.email ?? "",
      phone_number: user.vendor_manager?.phone_number ?? "",
    });
	}
}, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setLogoFile(file);
  setLogoPreview(URL.createObjectURL(file));
};

const handleVendorChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
) => {
  setVendorDesc(e.target.value);
};

  const handleManagerChange = (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const { name, value } = e.target;
  setManagerForm(prev => ({ ...prev, [name]: value }));
};

  const handleSave = async () => {
    if (!user) return;

    try {
      // 1. 更新基本資料（所有角色）
      const basicData: { name?: string; phone_number?: string; address?: string } = {
        name: formData.name,
        phone_number: formData.phone_number,
      };

      // 2. Customer/Vendor 需要更新 address
      if (user.role === UserRole.CUSTOMER || user.role === UserRole.VENDOR) {
        basicData.address = formData.address;
      }

      await updateUserMutation.mutateAsync(basicData);

      // 3. Vendor 需要另外更新 description
	if (user.role === UserRole.VENDOR) {
  		await updateVendorDescMutation.mutateAsync({
    		description: vendorDesc,
  		});
	}

	await userQuery.refetch();

      alert("資料更新成功！");
    } catch (err: any) {
      console.error("更新失敗:", err);
      alert(`更新失敗: ${err.response?.data?.message || "未知錯誤"}`);
    }
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
          {/* 錯誤提示 */}
          {(updateUserMutation.isError || updateVendorDescMutation.isError) && (
            <div
              style={{
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "4px",
                padding: "12px",
                marginBottom: "16px",
                color: "#c00",
              }}
            >
              {updateUserMutation.error?.response?.data?.message ||
                updateVendorDescMutation.error?.response?.data?.message ||
                "更新失敗，請稍後再試"}
            </div>
          )}

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
			<label>商家 Logo</label>

			<div className={styles.logoUpload}>
			<img
				src={logoPreview || getAvatarSrc()}
				alt="Logo preview"
				className={styles.logoPreview}
			/>

			<input
				type="file"
				accept="image/*"
				onChange={handleLogoChange}
			/>
			</div>
		</div>
		)}

          {user.role === UserRole.VENDOR && (
            <div className={styles.formGroup}>
              <label>商家描述 (選填)</label>
              <textarea
                name="description"
                value={vendorDesc}
                onChange={handleVendorChange}
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
                {vendorDesc.length} / 200
              </div>
            </div>
          )}
		{user.role === UserRole.VENDOR && (
  <div className={styles.formGroup}>
    <label style={{ fontWeight: "bold" }}>商家負責人資訊</label>

    	<input
		  name="name"
    	  type="text"
    	  placeholder="負責人姓名"
		  value={managerForm.name}
    	  onChange={handleManagerChange}
    	  style={{ marginBottom: "8px" }}
    />

    	<input
		  name="email"
    	  type="email"
    	  placeholder="負責人 Email"
    	  value={managerForm.email}
    	  onChange={handleManagerChange}
    	  style={{ marginBottom: "8px" }}
    	/>

    	<input
		  name="phone_number"
    	  type="text"
    	  placeholder="負責人電話"
    	  value={managerForm.phone_number}
    	  onChange={handleManagerChange}
    	/>

    		<button
      			style={{ marginTop: "10px" }}
      			onClick={async () => {
        			try {
          				await updateVendorManagerMutation.mutateAsync(managerForm);
          				await userQuery.refetch();
          				alert("負責人資訊已儲存");
        			} catch (e) {
          				alert("儲存失敗");
        			}
      			}}
      			disabled={updateVendorManagerMutation.isPending}
    		>
      			{updateVendorManagerMutation.isPending
        			? "更新中..."
        			: "儲存負責人資訊"}
    		</button>

    		{updateVendorManagerMutation.isError && (
      			<p style={{ color: "red", marginTop: "6px" }}>
        			更新失敗，請確認資料是否正確
      			</p>
    		)}
			<div
      			style={{
    		    marginTop: "12px",
    		    padding: "10px",
    		    background: "#2b2b2b",
    		    borderRadius: "6px",
    		    fontSize: "0.85rem",
    		    color: "#ccc",
    		  }}
    		>
    		  <strong>目前已儲存：</strong>
    		  <div>姓名：{user.vendor_manager?.name || "尚未設定"}</div>
    		  <div>Email：{user.vendor_manager?.email || "尚未設定"}</div>
    		  <div>電話：{user.vendor_manager?.phone_number || "尚未設定"}</div>
    </div>
  		</div>
		)}

          <button
            className={styles.saveBtn}
            onClick={handleSave}
            disabled={
              updateUserMutation.isPending ||
              updateVendorDescMutation.isPending
            }
          >
            {updateUserMutation.isPending || updateVendorDescMutation.isPending
              ? "儲存中..."
              : "儲存修改"}
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
