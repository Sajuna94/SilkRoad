import type { Product, SizeOptionItem } from "@/types/store";
import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
  useMemo,
} from "react";
import styles from "./ProductModal.module.scss";
import { Dialog, type DialogRef } from "@/components/ui/Dialog";
import { QuantityInput } from "@/components/atoms/QuantityInput";
import { useProductDetail } from "@/hooks/auth/vendor";

export interface ProductModalRef {
  open: (
    product: Product,
    quantity?: number,
    initialFormState?: Partial<FormState>
  ) => void;
  close: () => void;
  getForm: () => FormState;
}

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

const defaultSize: SizeOptionItem = { name: "", price: 0 };

export const ProductModal = forwardRef<ProductModalRef, ProductModalProps>(
  ({ onSubmit, submitText, needFetch = true }, ref) => {
    const dialogRef = useRef<DialogRef>(null);
    const initialFormStateRef = useRef<Partial<FormState> | undefined>(
      undefined
    );

    const [product, setProduct] = useState<Product>({} as Product);

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
    const [detailLoaded, setDetailLoaded] = useState(false);

    const { data: productDetail } = useProductDetail(vendorId, productId);

    // 計算總價： (基本價 + 尺寸加價) * 數量
    const totalPrice = useMemo(() => {
      const basePrice = product.price || 0;
      const sizeDelta = form.size?.price || 0;
      return (basePrice + sizeDelta) * form.quantity;
    }, [product.price, form.size, form.quantity]);

    useEffect(() => {
      if (productDetail && modalOpenTrigger > 0) {
        setProduct(productDetail);
        setDetailLoaded(true);

        setForm((prevForm) => {
          const initial = initialFormStateRef.current;

          // 1. 取得 API 回傳的完整尺寸列表 (包含價格)
          const detailSizes = productDetail?.options?.size || [];

          // 2. 決定要找哪個尺寸名稱
          // 如果有外部傳入的初始值(編輯模式)就用初始值，否則用目前表單選到的(來自 open 函式)
          const targetSizeName = initial?.size?.name || prevForm.size.name;

          // 3. 在詳細資料中找到對應的尺寸物件 (這裡面才有正確的 price)
          // 如果找不到 (例如剛打開)，就預設用第一個
          const matchedSize =
            detailSizes.find((s) => s.name === targetSizeName) ||
            detailSizes[0] ||
            defaultSize;

          return {
            // 使用 matchedSize (含價格) 覆蓋原本的 size (可能缺價格)
            size: matchedSize,
            ice:
              initial?.ice ||
              prevForm.ice ||
              productDetail?.options?.ice?.[0] ||
              "",
            sugar:
              initial?.sugar ||
              prevForm.sugar ||
              productDetail?.options?.sugar?.[0] ||
              "",
            quantity: initial?.quantity || prevForm.quantity || 1,
          };
        });

        initialFormStateRef.current = undefined;
      }
    }, [productDetail, modalOpenTrigger]);

    useImperativeHandle(ref, () => ({
      open: (
        newProduct: Product,
        newQuantity = 1,
        formState?: Partial<FormState>
      ) => {
        initialFormStateRef.current = formState;
        setModalOpenTrigger((prev) => prev + 1);
        setDetailLoaded(false);

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
        setDetailLoaded(false);
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
          {needFetch && !detailLoaded ? (
            <div className={styles["loading"]}>載入商品詳情中...</div>
          ) : (
            <>
              <header>
                <div className={styles["name"]}>{product.name}</div>
                {/* 顯示計算後的總價 */}
                <div className={styles["price"]}>
                  NT$ {totalPrice}
                  {form.size.price > 0 && (
                    <span style={{ fontSize: "0.8em", marginLeft: "8px" }}>
                      (含加價)
                    </span>
                  )}
                </div>
                <div className={styles["desc"]}>{product.description}</div>
              </header>
              <div className={styles["content"]}>
                {/* Size 下拉選單：傳入物件陣列 */}
                <OptionDropdown
                  id="size"
                  label="大小"
                  value={form.size.name}
                  options={[...(product?.options?.size ?? [])].sort(
                    (a, b) => a.price - b.price
                  )}
                  onChange={(val) => {
                    const selectedObj =
                      product.options.size.find((s) => s.name === val) ||
                      defaultSize;
                    setForm({ ...form, size: selectedObj });
                  }}
                  isSizeOption={true}
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
                  disabled={pending || (needFetch && !detailLoaded)}
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

interface OptionDropdownProps {
  id: string;
  label: string;
  value: string; // 當前選中的值 (名稱)
  options: string[] | SizeOptionItem[]; // 支援兩種型別
  onChange: (val: string) => void;
  isSizeOption?: boolean;
}

const OptionDropdown = ({
  id,
  label,
  value,
  options,
  onChange,
  isSizeOption,
}: OptionDropdownProps) => {
  return (
    <div className={styles["dropdown"]}>
      <label htmlFor={id}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => {
          // 判斷是物件還是字串
          if (isSizeOption && typeof option !== "string") {
            const sizeOpt = option as SizeOptionItem;
            return (
              <option key={sizeOpt.name} value={sizeOpt.name}>
                {sizeOpt.name}{" "}
                {sizeOpt.price > 0 ? `(+${sizeOpt.price}元)` : ""}
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
