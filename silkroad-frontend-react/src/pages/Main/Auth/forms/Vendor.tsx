
import LabeledInput from "@/components/molecules/LabeledInput";
import styles from "./Form.module.scss"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterRole } from "@/hooks/auth/user";
import { UserRole } from "@/types/user";

export const VendorForm = () => {
    const navigate = useNavigate();
    const [managerForm, setManagerForm] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [vendorForm, setVendorForm] = useState({
        name: "",
        address: "",
    });
    const [validationError, setValidationError] = useState("");

    const registerMutation = useRegisterRole(UserRole.VENDOR);

    const validateForm = () => {
        // 管理人姓名驗證
        if (managerForm.name.trim().length === 0) {
            setValidationError("請輸入管理人姓名");
            return false;
        }

        // 管理人 Email 驗證
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(managerForm.email)) {
            setValidationError("請輸入有效的管理人 Email 地址");
            return false;
        }

        // 管理人電話驗證
        if (managerForm.phone.trim().length === 0) {
            setValidationError("請輸入管理人電話號碼");
            return false;
        }

        // 店家名稱驗證
        if (vendorForm.name.trim().length === 0) {
            setValidationError("請輸入店家名稱");
            return false;
        }

        // 店家地址驗證
        if (vendorForm.address.trim().length === 0) {
            setValidationError("請輸入店家地址");
            return false;
        }

        setValidationError("");
        return true;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        console.log("Vendor Info:", vendorForm);
        console.log("Manager Info:", managerForm);

        registerMutation.mutate({
            manager: {
                name: managerForm.name,
                email: managerForm.email,
                phone_number: managerForm.phone,
            },
            vendor: {
                name: vendorForm.name,
                address: vendorForm.address,
            },
        }, {
            onSuccess: (user) => {
                console.log("註冊成功:", user);
                navigate("/home");
            },
        });
    }

    return (
        <form className={styles['form']} onSubmit={handleSubmit}>
            {validationError && (
                <div className={styles['error']}>
                    {validationError}
                </div>
            )}

            {registerMutation.isError && (
                <div className={styles['error']}>
                    {registerMutation.error.response?.data?.message || "註冊失敗，請稍後再試"}
                </div>
            )}

            <div style={{ display: 'flex', gap: '30px' }}>
                <div>
                    <h2 className={styles['title']}>管理人資訊</h2>
                    <LabeledInput
                        label="Name"
                        value={managerForm.name}
                        onChange={(value) => setManagerForm({ ...managerForm, name: value })}
                    />
                    <LabeledInput
                        label="Email"
                        value={managerForm.email}
                        onChange={(value) => setManagerForm({ ...managerForm, email: value })}
                    />
                    <LabeledInput
                        label="Phone"
                        value={managerForm.phone}
                        onChange={(value) => setManagerForm({ ...managerForm, phone: value })}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                    <h2 className={styles['title']}>店家資料</h2>
                    <LabeledInput
                        label="Name"
                        value={vendorForm.name}
                        onChange={(value) => setVendorForm({ ...vendorForm, name: value })}
                    />
                    <LabeledInput
                        label="Address"
                        value={vendorForm.address}
                        onChange={(value) => setVendorForm({ ...vendorForm, address: value })}
                    />
                    <button
                        type="submit"
                        className={styles['button']}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? "處理中" : "註冊"}
                    </button>
                </div>
            </div>
        </form>
    );
}