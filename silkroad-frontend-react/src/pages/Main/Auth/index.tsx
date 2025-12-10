import styles from "./Auth.module.scss";
import { LoginForm } from "./forms/Login";
import { RegisterForm } from "./forms/Register";

type FormType = "login" | "register";

export default function AuthForm({ type }: { type: FormType }) {
    return (
        <>
            <div className={styles['background']}></div>
            <div className={styles['centered']}>
                {type === "login" && <LoginForm />}
                {type === "register" && <RegisterForm />}
            </div>
        </>
    );
}
