import type { Product, SizeOptionItem } from "@/types/store"; // 記得引入 SizeOptionItem
import { forwardRef, useImperativeHandle, useRef, useState, useEffect, useMemo } from "react";
import styles from "./ProductModal.module.scss";
import { Dialog, type DialogRef } from "@/components/ui/Dialog";
import { QuantityInput } from "@/components/atoms/QuantityInput";
import { useProductDetail } from "@/hooks/auth/vendor";

export interface ProductModalRef {
  // 修改 open 的參數，讓初始狀態也能支援新的結構
  open: (product: Product, quantity?: number, initialFormState?: Partial<FormState>) => void;
  close: () => void;
  getForm: () => FormState;
}

// [修改] FormState 的 size 改存物件，方便後續計算
interface FormState {
  size: SizeOptionItem; 
  ice: string;
  sugar: string;
  quantity: number;
}

interface ProductModalProps {
  onSubmit?: () => Promise<void> | void;
  submitText?: string;
  needFetch?: boolean;
}

// 預設的空尺寸物件
const defaultSize: SizeOptionItem = { name: "", price: 0 };

export const ProductModal = forwardRef<ProductModalRef, ProductModalProps>(
  ({ onSubmit, submitText, needFetch = true }, ref) => {
    const dialogRef = useRef<DialogRef>(null);
    const initialFormStateRef = useRef<Partial<FormState> | undefined>(undefined);
    
    const [product, setProduct] = useState<Product>({} as Product);
    
    // [修改] 初始狀態 size 改為物件
    const [form, setForm] = useState<FormState>({
      size: defaultSize,
      ice: "",
      sugar: "",
      quantity: 1,
    });
    
    const [pending, setPending] = useState(false);
    const [vendorId, setVendorId] = useState<number | undefined>(undefined);
    const [productId, setProductId] = useState<number | undefined>(undefined);
    const [modalOpenTrigger, setModalOpenTrigger] = useState(0);

    const { data: productDetail, isLoading: isLoadingDetail } = useProductDetail(vendorId, productId);

    // [新增] 計算總價： (基本價 + 尺寸加價) * 數量
    const totalPrice = useMemo(() => {
        const basePrice = product.price || 0;
        const sizeDelta = form.size?.price || 0;
        return (basePrice + sizeDelta) * form.quantity;
    }, [product.price, form.size, form.quantity]);

    useEffect(() => {
      if (productDetail && modalOpenTrigger > 0) {
        setProduct(productDetail);
        
        // 處理 Size 預設值 (取第一個選項)
        // 注意：API 回傳的 productDetail.options.size 是一個物件陣列
        const firstSize = productDetail?.options?.size?.[0] || defaultSize;
        
        const initial = initialFormStateRef.current;
        
        setForm((prevForm) => ({
          size: initial?.size || firstSize,
          ice: initial?.ice || productDetail?.options?.ice?.[0] || "",
          sugar: initial?.sugar || productDetail?.options?.sugar?.[0] || "",
          quantity: prevForm.quantity,
        }));
        
        initialFormStateRef.current = undefined;
      }
    }, [productDetail, modalOpenTrigger]);

    useImperativeHandle(ref, () => ({
      open: (newProduct: Product, newQuantity = 1, formState?: Partial<FormState>) => {
        initialFormStateRef.current = formState;
        setModalOpenTrigger((prev) => prev + 1);

        setProduct(newProduct);
        setVendorId(newProduct.vendor_id);
        setProductId(newProduct.id);

        const firstSize = newProduct?.options?.size?.[0] || defaultSize;

        setForm({
          size: formState?.size || firstSize,
          ice: formState?.ice || newProduct?.options?.ice?.[0] || "",
          sugar: formState?.sugar || newProduct?.options?.sugar?.[0] || "",
          quantity: newQuantity,
        });
        dialogRef.current?.open();
      },
      close: () => {
        dialogRef.current?.close();
        setVendorId(undefined);
        setProductId(undefined);
        initialFormStateRef.current = undefined;
      },
      getForm: () => form,
    }));

    const handleSubmit = async () => {
      if (!onSubmit) return;
      try {
        setPending(true);
        await onSubmit();
        dialogRef.current?.close();
      } finally {
        setPending(false);
      }
    };

    return (
      <Dialog ref={dialogRef}>
        <picture>
          <img src={product.image_url} alt={product.name} />
        </picture>
        <form>
          {needFetch && isLoadingDetail ? (
            <div className={styles["loading"]}>載入商品詳情中...</div>
          ) : (
            <>
              <header>
                <div className={styles["name"]}>{product.name}</div>
                {/* [修改] 顯示計算後的總價 */}
                <div className={styles["price"]}>
                    NT$ {totalPrice}
                    {form.size.price > 0 && <span style={{fontSize: "0.8em", marginLeft: "8px"}}>(含加價)</span>}
                </div>
                <div className={styles["desc"]}>{product.description}</div>
              </header>
              <div className={styles["content"]}>
                
                {/* [修改] Size 下拉選單：傳入物件陣列 */}
                <OptionDropdown
                  id="size"
                  label="大小"
                  value={form.size.name} // 選單顯示的是名稱
                  options={product?.options?.size ?? []} // 這裡是 SizeOptionItem[]
                  // 當選擇改變時，我們要從 options 裡找出對應的完整物件 (含 price)
                  onChange={(val) => {
                      const selectedObj = product.options.size.find(s => s.name === val) || defaultSize;
                      setForm({ ...form, size: selectedObj });
                  }}
                  isSizeOption={true} // 標記這是尺寸選項，需要特殊渲染
                />

                <OptionDropdown
                  id="ice"
                  label="冰度"
                  value={form.ice}
                  options={product?.options?.ice ?? []} // 這裡是 string[]
                  onChange={(val) => setForm({ ...form, ice: val })}
                />

                <OptionDropdown
                  id="sugar"
                  label="甜度"
                  value={form.sugar}
                  options={product?.options?.sugar ?? []} // 這裡是 string[]
                  onChange={(val) => setForm({ ...form, sugar: val })}
                />

                <QuantityInput
                  value={form.quantity}
                  onChange={(val) => setForm({ ...form, quantity: val })}
                />
              </div>
              <footer>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={pending || isLoadingDetail}
                >
                  {pending ? "處理中..." : submitText} - NT$ {totalPrice}
                </button>
              </footer>
            </>
          )}
        </form>
      </Dialog>
    );
  }
);

// --- 修改 Dropdown 元件以支援物件與字串 ---

interface OptionDropdownProps {
  id: string;
  label: string;
  value: string; // 當前選中的值 (名稱)
  options: string[] | SizeOptionItem[]; // 支援兩種型別
  onChange: (val: string) => void;
  isSizeOption?: boolean; // 新增旗標
}

const OptionDropdown = ({ id, label, value, options, onChange, isSizeOption }: OptionDropdownProps) => {
  return (
    <div className={styles["dropdown"]}>
      <label htmlFor={id}>{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => {
            // 判斷是物件還是字串
            if (isSizeOption && typeof option !== 'string') {
                const sizeOpt = option as SizeOptionItem;
                return (
                    <option key={sizeOpt.name} value={sizeOpt.name}>
                        {sizeOpt.name} {sizeOpt.price > 0 ? `(+${sizeOpt.price}元)` : ""}
                    </option>
                );
            } else {
                // 原本的字串邏輯 (Sugar/Ice)
                const strOpt = option as string;
                return (
                    <option key={strOpt} value={strOpt}>
                        {strOpt}
                    </option>
                );
            }
        })}
      </select>
    </div>
  );
};