
import React from "react";
import styles from "./Form.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/auth/login";
import LabeledInput from "@/components/molecules/LabeledInput";

export const LoginForm = () => {
    const prefill = undefined as { email?: string; password?: string } | undefined;
    const [form, setForm] = React.useState({
        email: prefill?.email || "admin@example.com",
        password: prefill?.password || "123"
    });
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login:", form);

        loginMutation.mutate(
            { email: form.email, password: form.password },
            {
                onSuccess: (user) => {
                    console.log("登入成功:", user);
                    navigate("/home");
                },
                onError: (error) => {
                    console.error("登入失敗:", error.response?.data);
                }
            }
        );
    };

    return (
        <form className={styles['form']} onSubmit={handleSubmit}>
            <h2 className={styles['title']}>登入帳號</h2>

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

            <button
                type="submit"
                className={styles['button']}
                disabled={loginMutation.isPending}
            >
                {loginMutation.isPending ? "處理中" : "登入"}
            </button>

            <div className={styles['footer']}>
                尚未註冊?
                <Link to="/register">建立帳號</Link>
            </div>
        </form>
    );
}