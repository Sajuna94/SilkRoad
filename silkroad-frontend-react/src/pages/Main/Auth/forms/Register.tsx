import React from "react";
import styles from "./Form.module.scss";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/user";
import LabeledInput from "@/components/molecules/LabeledInput";
import { VendorForm } from "./Vendor";
import { CustomerForm } from "./Customer";

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

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setValidationError("請輸入有效的 Email 地址");
      return false;
    }

    if (form.password.length === 0) {
      setValidationError("請輸入密碼");
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
