import styles from "./Auth.module.scss"
import { useState } from "react";
import LabeledInput from "@/components/molecules/LabeledInput/LabeledInput";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/auth/login";

export default function LoginPage() {
    const [form, setForm] = useState({
        email: "", password: ""
    })

    const loginMutation = useLogin();

    const handleSubmit = () => {
        console.log("Login:", form);

        loginMutation.mutate(
            { email: form.email, password: form.password },
            {
                onSuccess: (user) => {
                    console.log("登入成功:", user);
                    // localStorage.setItem("user", JSON.stringify(user));
                },
                onError: (error) => {
                    console.error("登入失敗:", error.response?.data);
                }
            }
        );
    };

    return (
        <>
            <div className={styles['background']}></div>
            <div className={styles['centered']}>
                <form className={styles['form']} onSubmit={handleSubmit}>
                    <h2 className={styles['title']}>登入帳號</h2>

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

                    <button
                        className={styles['button']}
                        disabled={loginMutation.isPending}
                        onClick={handleSubmit}
                    >
                        {loginMutation.isPending ? "處理中" : "登入"}
                    </button>

                    <div className={styles['footer']}>
                        尚未註冊?
                        <Link to="/register"> 建立帳號</Link>
                    </div>
                </form>
            </div>
        </>
    );
}
