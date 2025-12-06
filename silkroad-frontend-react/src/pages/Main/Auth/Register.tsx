import LabeledInput from "@/components/molecules/LabeledInput/LabeledInput";
import styles from "./Auth.module.scss";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/login";

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: "", email: "", password: ""
    })

    const registerMutation = useRegister();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        console.log(form);

        registerMutation.mutate({
            name: form.name,
            email: form.email,
            password: form.password,
        },
            {
                onSuccess: (user) => {
                    console.log("註冊成功:", user);
                    // localStorage.setItem("user", JSON.stringify(user));
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

                    <button type="submit" className={styles['button']}>
                        註冊
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
