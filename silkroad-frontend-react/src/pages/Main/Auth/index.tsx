import styles from "./Auth.module.scss";
import { LoginForm } from "./forms/Login";
import { RegisterForm } from "./forms/Register";
import { VerifyEmailForm } from "./forms/VerifyEmail";
import { ForgotPasswordForm } from "./forms/ForgotPassword";

type FormType = "login" | "register" | "verify-email" | "forgot-password";

export default function AuthForm({ type }: { type: FormType }) {
    return (
        <>
            <div className={styles['background']}></div>
            <div className={styles['centered']}>
                {type === "login" && <LoginForm />}
                {type === "register" && <RegisterForm />}
                {type === "verify-email" && <VerifyEmailForm />}
                {type === "forgot-password" && <ForgotPasswordForm />}
            </div>
        </>
    );
}
