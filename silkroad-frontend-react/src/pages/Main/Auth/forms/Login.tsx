
import React from "react";
import styles from "./Form.module.scss";
import { Link, useNavigate } from "react-router-dom";
import { useLogin } from "@/hooks/auth/user";
import LabeledInput from "@/components/molecules/LabeledInput";

export const LoginForm = () => {
    const prefill = undefined as { email?: string; password?: string } | undefined;
    const [form, setForm] = React.useState({
        email: prefill?.email || "customer@example.com",
        password: prefill?.password || "123"
    });
    const [error, setError] = React.useState<any>(" ");
    const navigate = useNavigate();
    const loginMutation = useLogin();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Login Form:", form);

        loginMutation.mutate(
            { email: form.email, password: form.password },
            {
                onSuccess: () => {
                    navigate("/home");
                },
                onError: (error) => {
                    const data = error.response?.data;
                    if (data?.requires_verification) {
                        const email = data.email || "";
                        navigate(`/verify-email?email=${encodeURIComponent(email)}`, { 
                            state: { email } 
                        });
                    } else {
                        setError(data?.message || "登入失敗");
                    }
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

            <div>
                <LabeledInput
                    label="Password"
                    type="password"
                    value={form.password}
                    onChange={(value) => setForm({ ...form, password: value })}
                />

                <Error message={error} />

                <div style={{ textAlign: 'right', marginTop: '8px' }}>
                    <Link
                        to="/forgot-password"
                        style={{
                            fontSize: '0.85rem',
                            color: '#1890ff',
                            textDecoration: 'none'
                        }}
                    >
                        忘記密碼？
                    </Link>
                </div>
            </div>


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

const Error = ({ message }: { message: string }) => {
    return (
        <div style={{ fontSize: '0.8rem', color: 'red' }}>
            {message}
        </div>
    );
};