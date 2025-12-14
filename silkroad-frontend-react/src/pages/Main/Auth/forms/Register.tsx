
import React from "react";
import styles from "./Form.module.scss";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/user";
import LabeledInput from "@/components/molecules/LabeledInput";
import { VendorForm } from "./Vendor";
import { CustomerForm } from "./Customer";
import { UserRole } from "@/types/user";

export const RegisterForm = () => {
    const registerMutation = useRegister(UserRole.GUEST);

    const [hash, setHash] = React.useState(window.location.hash.replace("#", ""));
    const [form, setForm] = React.useState({
        email: "vendor@example.com",
        password: "123",
        phone: "123",
        role: "vendor",
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(form);

        window.location.hash = form.role;
        setHash(form.role.replace("#", ""));

        registerMutation.mutate({
            email: form.email,
            password: form.password,
            phone_number: form.phone,
            role: form.role,
        },
            {
                onSuccess: (user) => {
                    console.log("註冊成功:", user);
                    // navigate("/login", { state: { email: form.email, password: form.password } });
                },
                onError: (error) => {
                    console.error("註冊失敗:", error.response?.data);
                }
            }
        )
    };

    if (hash === "vendor") return <VendorForm />;
    if (hash === "customer") return <CustomerForm />;

    return (
        <form className={styles['form']} onSubmit={handleSubmit}>
            <h2 className={styles['title']}>註冊帳號</h2>

            <LabeledInput
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
            />

            <LabeledInput
                label="Password"
                type="password"
                value={form.password}
                onChange={(value) => setForm({ ...form, password: value })}
            />

            <div>
                <LabeledInput
                    label="Phone"
                    type="text"
                    value={form.phone}
                    onChange={(value) => setForm({ ...form, phone: value })}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <label>Role</label>
                    <select
                        id="role"
                        style={{ flex: '1' }}
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                        <option value="customer">Customer</option>
                        <option value="vendor">Vendor</option>
                    </select>
                </div>

            </div>

            <button
                type="submit"
                className={styles['button']}
                disabled={registerMutation.isPending}
            >
                {registerMutation.isPending ? "處理中" : "註冊"}
            </button>

            <div className={styles['footer']}>
                已有帳號?
                <Link to="/login"> 登入</Link>
            </div>
        </form>
    );
}

interface LabeledSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
    error?: string;
}

export default function LabeledSelect({
    label,
    value,
    onChange,
    options,
    required = true,
    error,
}: LabeledSelectProps) {
    return (
        <div className={`${styles.field} ${value ? styles.filled : ""} ${error ? styles.error : ""}`}>
            <div className={styles["select-wrapper"]}>
                <select
                    className={styles.select}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required={required}
                >
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                <label className={styles.label}>{label}</label>
            </div>

            {error && <div className={styles.message}>{error}</div>}
        </div>
    );
}