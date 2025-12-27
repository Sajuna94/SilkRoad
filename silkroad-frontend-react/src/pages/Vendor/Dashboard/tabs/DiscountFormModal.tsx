import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./DiscountFormModal.module.scss";

export type DiscountType = "PERCENTAGE" | "FIXED";
export type MembershipLevel = "ALL" | "BRONZE" | "SILVER" | "GOLD" | "DIAMOND";

export interface DiscountForm {
  id?: string;
  code: string;
  start_date: string;
  expiry_date: string;
  type: DiscountType;
  value: number;
  min_purchase: string;
  max_discount: string;
  membership_limit: MembershipLevel;
}

interface PostDiscountProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DiscountForm) => void;
  initialData?: DiscountForm | null; // 如果有傳入，代表是編輯模式
  existingCodes: string[]; // 用來檢查重複
}

export default function PostDiscount({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  existingCodes,
}: PostDiscountProps) {
  const defaultState: DiscountForm = {
    code: "",
    start_date: "",
    expiry_date: "",
    type: "PERCENTAGE",
    value: 0,
    min_purchase: "",
    max_discount: "",
    membership_limit: "ALL",
  };

  const [formData, setFormData] = useState<DiscountForm>(defaultState);
  const [error, setError] = useState<string>("");

  // 當開啟或切換編輯模式時，重置表單
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(initialData);
      } else {
        setFormData(defaultState);
      }
      setError("");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setError(""); // 清除錯誤

    // 百分比限制邏輯
    if (name === "value" && formData.type === "PERCENTAGE") {
      let numVal = parseInt(value) || 0;
      if (numVal > 99) numVal = 99;
      if (numVal < 0) numVal = 0;
      setFormData((prev) => ({ ...prev, [name]: numVal }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (type: DiscountType) => {
    setFormData((prev) => ({ ...prev, type, value: 0 }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 驗證折價碼長度
    if (formData.code.length < 3) {
      setError("折價碼長度至少需要 3 個字元");
      return;
    }
    if (formData.code.length > 20) {
      setError("折價碼長度不能超過 20 個字元");
      return;
    }

    // 2. 驗證日期邏輯
    if (!formData.start_date) {
      setError("請選擇開始日期");
      return;
    }
    if (formData.expiry_date && formData.start_date > formData.expiry_date) {
      setError("結束日期不能早於開始日期");
      return;
    }

    // 3. 驗證折扣數值
    if (formData.value <= 0) {
      setError("折扣數值必須大於 0");
      return;
    }
    if (formData.type === "PERCENTAGE" && formData.value >= 100) {
      setError("百分比折扣不能大於或等於 100%");
      return;
    }

    // 4. 驗證低消和折扣值的關係（固定金額類型）
    if (formData.type === "FIXED" && formData.min_purchase) {
      const minPurchase = parseInt(formData.min_purchase);
      if (minPurchase <= formData.value) {
        setError("低消限制必須大於折扣金額");
        return;
      }
    }

    // 5. 驗證折扣碼重複 (如果是編輯模式，排除原本自己的 code)
    const isDuplicate = existingCodes.includes(formData.code);
    const isEditingSelf = initialData && initialData.code === formData.code;

    if (isDuplicate && !isEditingSelf) {
      setError(`折扣碼 "${formData.code}" 已經存在，請更換一個。`);
      return;
    }

    onSubmit(formData);
    onClose();
  };

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={styles.modal}>
        <header className={styles.header}>
          <h2>{initialData ? "編輯折扣活動" : "發布新折扣"}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            &times;
          </button>
        </header>

        {error && <div className={styles.errorBanner}>{error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            <label htmlFor="code">
              折扣代碼
              <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '8px' }}>
                ({formData.code.length}/20 字元)
              </span>
            </label>
            <input
              id="code"
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={20}
              className={styles.input}
              placeholder="例如: NEWOPEN88 (3-20字元)"
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>開始日期</label>
              <input
                id="start_date"
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>結束日期 (選填)</label>
              <input
                id="expiry_date"
                type="date"
                name="expiry_date"
                value={formData.expiry_date}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.typeSection}>
            <label>折扣類型</label>
            <div className={styles.toggleContainer}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  formData.type === "PERCENTAGE" ? styles.active : ""
                }`}
                onClick={() => handleTypeChange("PERCENTAGE")}
              >
                % 百分比
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${
                  formData.type === "FIXED" ? styles.active : ""
                }`}
                onClick={() => handleTypeChange("FIXED")}
              >
                $ 固定金額
              </button>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>折扣數值</label>
            <div className={styles.inputWrapper}>
              {formData.type === "FIXED" && (
                <span className={styles.prefix}>$</span>
              )}
              <input
                id="value"
                type="number"
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
                className={styles.input}
              />
              {formData.type === "PERCENTAGE" && (
                <span className={styles.suffix}>% off</span>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label>低消限制</label>
              <input
                id="min_purchase"
                type="number"
                name="min_purchase"
                value={formData.min_purchase}
                onChange={handleChange}
                placeholder="0"
                className={styles.input}
              />
            </div>
            <div className={styles.inputGroup}>
              <label>最高折抵</label>
              <input
                id="max_discount"
                type="number"
                name="max_discount"
                value={formData.max_discount}
                onChange={handleChange}
                disabled={formData.type === "FIXED"}
                className={styles.input}
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label>會員限制</label>
            <select
              id="membership_limit"
              name="membership_limit"
              value={formData.membership_limit}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="ALL">所有會員</option>
              <option value="BRONZE">銅牌以上</option>
              <option value="SILVER">銀牌以上</option>
              <option value="GOLD">金牌以上(cliu限定)</option>
            </select>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={onClose}
              className={styles.btnSecondary}
            >
              取消
            </button>
            <button type="submit" className={styles.btnPrimary}>
              {initialData ? "儲存修改" : "確認發布"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
