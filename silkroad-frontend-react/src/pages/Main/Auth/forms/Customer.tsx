
import LabeledInput from "@/components/molecules/LabeledInput";
import styles from "./Form.module.scss"
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterRole } from "@/hooks/auth/user";
import { UserRole } from "@/types/user";

export const CustomerForm = () => {
    const navigate = useNavigate();
    const [customerForm, setCustomerForm] = useState({
        name: "",
        address: "",
    });
    const [validationError, setValidationError] = useState("");

    const registerMutation = useRegisterRole(UserRole.CUSTOMER);

    const validateForm = () => {
        // 姓名驗證
        if (customerForm.name.trim().length === 0) {
            setValidationError("請輸入姓名");
            return false;
        }

        // 地址驗證
        if (customerForm.address.trim().length === 0) {
            setValidationError("請輸入地址");
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

        console.log("Customer Info:", customerForm);

        registerMutation.mutate({
            name: customerForm.name,
            address: customerForm.address,
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

            <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignContent: 'center' }}>
                    <h2 className={styles['title']}>顧客資料</h2>
                    <LabeledInput
                        label="Name"
                        value={customerForm.name}
                        onChange={(value) => setCustomerForm({ ...customerForm, name: value })}
                    />
                    <LabeledInput
                        label="Address"
                        value={customerForm.address}
                        onChange={(value) => setCustomerForm({ ...customerForm, address: value })}
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