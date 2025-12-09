import LabeledInput from "@/components/molecules/LabeledInput/LabeledInput";
import styles from "./Auth.module.scss";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "@/hooks/auth/login";

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: "Customer",
        email: "customer@example.com",
        password: "123",
        phone: "12345",
        address: "tp",
        role: "customer",
    })

    const registerMutation = useRegister();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(form);

        registerMutation.mutate({
            name: form.name,
            email: form.email,
            password: form.password,
            phone_number: form.phone,
            address: form.address,
            role: form.role,
        },
            {
                onSuccess: (user) => {
                    console.log("註冊成功:", user);
                    navigate("/login", { state: { email: form.email, password: form.password } });
                },
                onError: (error) => {
                    console.error("註冊失敗:", error.response?.data);
                }
            }
        )
    };

    return (
        <>
            <div className={styles['background']}></div>
            <div className={styles['centered']}>
                <form className={styles['form']} onSubmit={handleSubmit}>
                    <h2 className={styles['title']}>註冊帳號</h2>

                    <LabeledInput
                        label="Name"
                        value={form.name}
                        onChange={(value) => setForm({ ...form, name: value })}
                        required
                    />

                    <LabeledInput
                        label="Email"
                        type="email"
                        value={form.email}
                        onChange={(value) => setForm({ ...form, email: value })}
                        required
                    />

                    <LabeledInput
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={(value) => setForm({ ...form, password: value })}
                        required
                    />

                    <LabeledInput
                        label="Phone"
                        type="text"
                        value={form.phone}
                        onChange={(value) => setForm({ ...form, phone: value })}
                        required
                    />

                    <LabeledInput
                        label="Addr"
                        type="text"
                        value={form.address}
                        onChange={(value) => setForm({ ...form, address: value })}
                        required
                    />

                    <OptionDropdown
                        id="role"
                        label="身分"
                        value={form.role}
                        options={["vendor", "customer"]}
                        onChange={(val) => setForm({ ...form, role: val })}
                    />

                    <button
                        type="submit"
                        className={styles['button']}
                        onClick={handleSubmit}
                        disabled={registerMutation.isPending}
                    >
                        {registerMutation.isPending ? "處理中" : "註冊"}
                    </button>

                    <div className={styles['footer']}>
                        已有帳號?
                        <Link to="/login"> 登入</Link>
                    </div>
                </form>
            </div>
        </>
    );
}

interface OptionDropdownProps {
    id: string;
    label: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
}

const OptionDropdown = ({ id, label, value, options, onChange }: OptionDropdownProps) => {
    return (
        <div className={styles['dropdown']}>
            <label htmlFor={id}>
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}
