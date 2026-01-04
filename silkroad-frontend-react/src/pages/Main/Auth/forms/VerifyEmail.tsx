import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Form.module.scss"; // 重用統一的 Form 樣式
import { useVerifyEmail, useResendCode } from "@/hooks/auth/user";

export function VerifyEmailForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  
  // OTP 6 位數狀態
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
  
  const verifyEmail = useVerifyEmail();
  const resendCode = useResendCode();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email") || (location.state as any)?.email;
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  useEffect(() => {
    let timer: any;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  // 處理 OTP 輸入
  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // 自動跳到下一格
    if (element.value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // 處理 Backspace (刪除並退回上一格)
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6).split("");
    if (pastedData.every(char => !isNaN(Number(char)))) {
        const newOtp = [...otp];
        pastedData.forEach((char, index) => {
            if(index < 6) newOtp[index] = char;
        });
        setOtp(newOtp);
        inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (!email || code.length !== 6) return;

    try {
      setMessage(null);
      await verifyEmail.mutateAsync({ email, code });
      setMessage({ type: 'success', text: "驗證成功！正在登入..." });
      setTimeout(() => navigate("/home"), 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || "驗證失敗" });
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0) return;

    try {
      setMessage(null);
      await resendCode.mutateAsync({ email });
      setMessage({ type: 'success', text: "驗證碼已重發！" });
      setCountdown(60); 
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || "重發失敗" });
    }
  };

  return (
    <div className={styles["form"]} style={{ textAlign: "center", maxWidth: "450px" }}>
      <h2 className={styles["title"]}>電子郵件驗證</h2>
      
      <p style={{ color: "#666", marginBottom: "20px", fontSize: "0.95rem" }}>
        我們已發送 6 位數驗證碼至 <br />
        <strong>{email || "您的信箱"}</strong>
      </p>

      {message && (
        <div className={styles["error"]} style={{ 
            backgroundColor: message.type === 'success' ? '#f6ffed' : '#fff2f0',
            borderColor: message.type === 'success' ? '#b7eb8f' : '#ffccc7',
            color: message.type === 'success' ? '#52c41a' : '#ff4d4f'
        }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleVerify}>
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginBottom: "24px" }}>
          {otp.map((data, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              maxLength={1}
              value={data}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              style={{
                width: "45px",
                height: "50px",
                fontSize: "1.2rem",
                textAlign: "center",
                border: "1px solid #d9d9d9",
                borderRadius: "6px",
                outline: "none",
                transition: "border-color 0.2s"
              }}
              onFocus={(e) => e.target.style.borderColor = "#40a9ff"}
              onBlur={(e) => e.target.style.borderColor = "#d9d9d9"}
            />
          ))}
        </div>

        <button 
          type="submit" 
          className={styles["button"]}
          disabled={verifyEmail.isPending || otp.join("").length !== 6}
          style={{ width: "100%", marginBottom: "16px" }}
        >
          {verifyEmail.isPending ? "驗證中..." : "確認驗證"}
        </button>
      </form>

      <div style={{ fontSize: "0.9rem", color: "#888" }}>
        沒收到驗證碼？{" "}
        <button 
          type="button" 
          onClick={handleResend} 
          disabled={countdown > 0 || resendCode.isPending}
          style={{ 
            background: "none", 
            border: "none", 
            color: countdown > 0 ? "#aaa" : "#1890ff", 
            cursor: countdown > 0 ? "default" : "pointer",
            fontWeight: "500",
            textDecoration: "underline"
          }}
        >
          {countdown > 0 ? `${countdown} 秒後可重發` : "重新發送驗證碼"}
        </button>
      </div>
    </div>
  );
}
