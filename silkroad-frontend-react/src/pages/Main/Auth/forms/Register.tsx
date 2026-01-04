import React, { useMemo } from "react";
import styles from "./Form.module.scss";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/user";
import LabeledInput from "@/components/molecules/LabeledInput";
import { VendorForm } from "./Vendor";
import { CustomerForm } from "./Customer";

const checkPasswordRequirements = (password: string) => {
  return {
    length: password.length >= 6,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

const calculatePasswordStrength = (
  reqs: ReturnType<typeof checkPasswordRequirements>
) => {
  let score = 0;
  if (reqs.length) score += 1;
  if (reqs.length && reqs.uppercase) score += 1;
  if (reqs.number) score += 1;
  if (reqs.special) score += 1;
  return Object.values(reqs).filter(Boolean).length;
};

export const RegisterForm = () => {
  const [currentStep, setCurrentStep] = React.useState<
    "basic" | "vendor" | "customer"
  >("basic");
  const [form, setForm] = React.useState({
    email: "",
    password: "",
    phone: "",
    role: "customer",
  });
  const [validationError, setValidationError] = React.useState("");

  const registerMutation = useRegister();

  const passwordReqs = useMemo(
    () => checkPasswordRequirements(form.password),
    [form.password]
  );

  const strengthScore = useMemo(
    () => calculatePasswordStrength(passwordReqs),
    [passwordReqs]
  );

  const getStrengthStyles = () => {
    switch (strengthScore) {
      case 0:
        return { width: "0%", color: "#e0e0e0", label: "" };
      case 1:
        return { width: "25%", color: "#ff4d4f", label: "弱" };
      case 2:
        return { width: "50%", color: "#faad14", label: "中" };
      case 3:
        return { width: "75%", color: "#faad14", label: "中强" };
      case 4:
        return { width: "100%", color: "#52c41a", label: "強" };
      default:
        return { width: "0%", color: "#e0e0e0", label: "" };
    }
  };

  const strengthStyle = getStrengthStyles();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setValidationError("請輸入有效的 Email 地址");
      return false;
    }

    if (!passwordReqs.length) {
      setValidationError("密碼至少需要 6 個字符");
      return false;
    }

    if (form.phone.trim().length === 0) {
      setValidationError("請輸入電話號碼");
      return false;
    }

    setValidationError("");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("Form Info:", form);

    registerMutation.mutate(
      {
        email: form.email,
        password: form.password,
        phone_number: form.phone,
        role: form.role,
      },
      {
        onSuccess: () => {
          setCurrentStep(form.role as "vendor" | "customer");
        },
        onError: (error) => {
          console.error("註冊失敗:", error.response?.data);
        },
      }
    );
  };

  const renderRequirement = (isValid: boolean, text: string) => (
    <div
      className={`${styles.reqItem} ${isValid ? styles.valid : styles.invalid}`}
    >
      <span className={styles.icon}>{isValid ? "✓" : "✗"}</span>
      <span>{text}</span>
    </div>
  );

  if (currentStep === "vendor") return <VendorForm />;
  if (currentStep === "customer") return <CustomerForm />;

  return (
    <form className={styles["form"]} onSubmit={handleSubmit}>
      <h2 className={styles["title"]}>註冊帳號</h2>

      {validationError && (
        <div className={styles["error"]}>{validationError}</div>
      )}

      {registerMutation.isError && (
        <div className={styles["error"]}>
          {registerMutation.error.response?.data?.message ||
            "註冊失敗，請稍後再試"}
        </div>
      )}

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

      {form.password && (
        <div className={styles.passwordStrength}>
          <div className={styles.strengthBarBg}>
            <div
              className={styles.strengthBarFill}
              style={{
                width: strengthStyle.width,
                backgroundColor: strengthStyle.color,
              }}
            />
          </div>

          <div
            className={styles.strengthLabel}
            style={{ color: strengthStyle.color }}
          >
            <span>密碼強度: {strengthStyle.label}</span>
          </div>

          <div className={styles.requirements}>
            {renderRequirement(passwordReqs.length, "至少 6 個字符")}
            {renderRequirement(passwordReqs.uppercase, "包含大寫字母 (A-Z)")}
            {renderRequirement(passwordReqs.number, "包含數字 (0-9)")}
            {renderRequirement(passwordReqs.special, "包含特殊符號 (!@#$...)")}
          </div>
        </div>
      )}

      <div>
        <LabeledInput
          label="Phone"
          type="text"
          value={form.phone}
          onChange={(value) => setForm({ ...form, phone: value })}
        />

        <div className={styles.roleGroup}>
          <label>Role</label>
          <select
            id="role"
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
        className={styles.button}
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? "處理中" : "註冊"}
      </button>

      <div className={styles.footer}>
        已有帳號?
        <Link to="/login"> 登入</Link>
      </div>
    </form>
  );
};

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
    <div
      className={`${styles.field} ${value ? styles.filled : ""} ${
        error ? styles.error : ""
      }`}
    >
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
