import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./Form.module.scss";
import LabeledInput from "@/components/molecules/LabeledInput";
import {
  useForgotPasswordSendCode,
  useForgotPasswordVerifyCode,
  useResetPassword,
} from "@/hooks/auth/user";

type Step = 1 | 2 | 3;

export function ForgotPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);

  const [email, setEmail] = useState("");

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const sendCode = useForgotPasswordSendCode();
  const verifyCode = useForgotPasswordVerifyCode();
  const resetPassword = useResetPassword();

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // OTP 相關處理函數
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every((char) => !isNaN(Number(char)))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  // Step 1: 發送驗證碼
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setMessage(null);
      await sendCode.mutateAsync({ email });
      setMessage({ type: "success", text: "驗證碼已發送至您的信箱" });
      setCountdown(60);
      setTimeout(() => setStep(2), 1000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "發送失敗",
      });
    }
  };

  // Step 2: 驗證驗證碼
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (!email || code.length !== 6) return;

    try {
      setMessage(null);
      await verifyCode.mutateAsync({ email, code });
      setMessage({ type: "success", text: "驗證成功！請設定新密碼" });
      setTimeout(() => setStep(3), 1000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "驗證失敗",
      });
    }
  };

  // Step 3: 重置密碼
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");

    if (!newPassword || !confirmPassword) {
      setMessage({ type: "error", text: "請填寫所有欄位" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "兩次密碼輸入不一致" });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "密碼長度至少需要6個字元" });
      return;
    }

    try {
      setMessage(null);
      await resetPassword.mutateAsync({
        email,
        code,
        new_password: newPassword,
      });
      setMessage({ type: "success", text: "密碼重置成功！正在跳轉..." });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "重置失敗",
      });
    }
  };

  // 重新發送驗證碼
  const handleResend = async () => {
    if (!email || countdown > 0) return;

    try {
      setMessage(null);
      await sendCode.mutateAsync({ email });
      setMessage({ type: "success", text: "驗證碼已重發！" });
      setCountdown(60);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "重發失敗",
      });
    }
  };

  return (
    <div className={styles["form"]}>
      <h2 className={styles["title"]}>忘記密碼</h2>

      {/* 步驟指示器 */}
      <div className={styles.stepIndicator}>
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`${styles.stepCircle} ${step >= s ? styles.active : ""}`}
          >
            {s}
          </div>
        ))}
      </div>

      {message && (
        <div
          className={`${styles["error"]} ${
            message.type === "success" ? styles.success : ""
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Step 1: 輸入 Email */}
      {step === 1 && (
        <form onSubmit={handleSendCode}>
          <p className={styles.description}>
            請輸入您的註冊信箱，我們將發送驗證碼給您
          </p>
          <LabeledInput
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            required
          />
          <button
            type="submit"
            className={styles["button"]}
            disabled={sendCode.isPending || !email}
          >
            {sendCode.isPending ? "發送中..." : "發送驗證碼"}
          </button>
        </form>
      )}

      {/* Step 2: 輸入驗證碼 */}
      {step === 2 && (
        <>
          <p className={styles.description}>
            我們已發送 6 位數驗證碼至
            <br />
            <strong>{email}</strong>
          </p>

          <form onSubmit={handleVerifyCode}>
            <div className={styles.otpContainer}>
              {otp.map((data, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleOtpChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  className={styles.otpInput}
                />
              ))}
            </div>

            <button
              type="submit"
              className={styles["button"]}
              disabled={verifyCode.isPending || otp.join("").length !== 6}
            >
              {verifyCode.isPending ? "驗證中..." : "確認驗證"}
            </button>
          </form>

          <div className={styles.resendSection}>
            沒收到驗證碼？{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || sendCode.isPending}
              className={styles.resendButton}
            >
              {countdown > 0 ? `${countdown} 秒後可重發` : "重新發送驗證碼"}
            </button>
          </div>
        </>
      )}

      {/* Step 3: 設定新密碼 */}
      {step === 3 && (
        <form onSubmit={handleResetPassword}>
          <p className={styles.description}>請設定您的新密碼</p>
          <LabeledInput
            label="新密碼（至少6個字元）"
            type="password"
            value={newPassword}
            onChange={setNewPassword}
            required
          />
          <LabeledInput
            label="確認新密碼"
            type="password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            required
          />
          <button
            type="submit"
            className={styles["button"]}
            disabled={
              resetPassword.isPending || !newPassword || !confirmPassword
            }
          >
            {resetPassword.isPending ? "重置中..." : "重置密碼"}
          </button>
        </form>
      )}

      <div className={styles.footer}>
        <Link to="/login">返回登入</Link>
      </div>
    </div>
  );
}
