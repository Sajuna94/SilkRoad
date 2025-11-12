import styles from "./ProductModal.module.css";
import { FadeInImage } from "@/components/atoms/FadeInImage/FadeInImage";
import { useCart } from "@/components/molecules/CartConText";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

interface ProductModalProps {
  previewSrc?: string;
  fullSrc: string;
  name: string;
  price: number;
  description: string;
  isEditMode?: boolean; // 是否為修改模式
  defaultValues?: {
    sugar?: string;
    ice?: string;
    quantity?: number;
    note?: string;
  };
  onConfirm?: (item: any) => void; // 編輯完成後回傳更新資料
}

export default function ProductModal({
  previewSrc,
  fullSrc,
  name,
  price,
  description,
  isEditMode = false,
  defaultValues,
  onConfirm,
}: ProductModalProps) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // 狀態管理
  const [sugar, setSugar] = useState(defaultValues?.sugar || "正常糖");
  const [ice, setIce] = useState(defaultValues?.ice || "正常冰");
  const [quantity, setQuantity] = useState(defaultValues?.quantity || 1);
  const [note, setNote] = useState(defaultValues?.note || "");

  const handleSubmit = () => {
    const item = {
      name,
      price: price * quantity,
      img: fullSrc,
      sugar,
      ice,
      quantity,
      note,
      description,
      id: Math.floor(Math.random() * 1000000), // 簡易產生唯一 id
    };

    if (isEditMode) {
      onConfirm?.(item); // 回傳更新的商品資料
    } else {
      addToCart(item);
      navigate("/cart");
    }
  };

  return (
    <section className={styles.modal}>
      <div className={styles.imageArea}>
        <FadeInImage previewSrc={previewSrc} fullSrc={fullSrc} alt={name} />
      </div>

      <div className={styles.content}>
        <h1 className={styles.name}>{name}</h1>
        <p className={styles.price}>NT ${price}</p>
        <p className={styles.description}>{description}</p>

        {/* --- 客製化選項區 --- */}
        <div className={styles.options}>
          <label>
            糖度：
            <select value={sugar} onChange={(e) => setSugar(e.target.value)}>
              <option>正常糖</option>
              <option>半糖</option>
              <option>無糖</option>
            </select>
          </label>

          <label>
            冰量：
            <select value={ice} onChange={(e) => setIce(e.target.value)}>
              <option>正常冰</option>
              <option>少冰</option>
              <option>去冰</option>
            </select>
          </label>

          <label>
            數量：
            <div className={styles.quantityControl}>
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className={styles.qtyBtn}
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className={styles.qtyBtn}
              >
                +
              </button>
            </div>
          </label>

          <label>
            備註：
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="例如：不要吸管、去冰少糖..."
              className={styles.noteArea}
            />
          </label>
        </div>

        <button className={styles.button} onClick={handleSubmit}>
          {isEditMode ? "修改完成" : "加入購物車"}
        </button>
      </div>
    </section>
  );
}
