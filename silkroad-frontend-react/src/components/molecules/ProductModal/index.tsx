import type { Product } from "@/types/store";
import { forwardRef, useImperativeHandle, useRef, useState, useEffect } from "react";
import styles from "./ProductModal.module.scss"
import { Dialog, type DialogRef } from "@/components/ui/Dialog";
import { QuantityInput } from "@/components/atoms/QuantityInput";
import { useProductDetail } from "@/hooks/auth/vendor";

export interface ProductModalRef {
    open: (product: Product, quantity?: number, initialFormState?: Partial<FormState>) => void;
    close: () => void;
    getForm: () => FormState;
}

interface FormState {
    size: string;
    ice: string;
    sugar: string;
    quantity: number;
}

interface ProductModalProps {
    onSubmit?: (form: FormState) => Promise<void> | void;
    submitText?: string;
}

export const ProductModal = forwardRef<ProductModalRef, ProductModalProps>(({ onSubmit, submitText }, ref) => {
    const dialogRef = useRef<DialogRef>(null);
    const initialFormStateRef = useRef<Partial<FormState> | undefined>(undefined);
    const [product, setProduct] = useState<Product>({} as Product);
    const [form, setForm] = useState<FormState>({
        size: "", ice: "", sugar: "", quantity: 1,
    });
    const [pending, setPending] = useState(false);
    const [vendorId, setVendorId] = useState<number | undefined>(undefined);
    const [productId, setProductId] = useState<number | undefined>(undefined);
    const [modalOpenTrigger, setModalOpenTrigger] = useState(0);

    // Fetch product detail when modal opens
    const { data: productDetail, isLoading: isLoadingDetail } = useProductDetail(vendorId, productId);

    // Update product and form when product detail is loaded OR when modal is opened
    useEffect(() => {
        if (productDetail && modalOpenTrigger > 0) {
            setProduct(productDetail);
            // Use initialFormState from ref if provided, otherwise use first options
            const initial = initialFormStateRef.current;
            setForm(prevForm => ({
                size: initial?.size || productDetail?.options?.size[0] || "",
                ice: initial?.ice || productDetail?.options?.ice[0] || "",
                sugar: initial?.sugar || productDetail?.options?.sugar[0] || "",
                quantity: prevForm.quantity, // Keep the quantity from initial open
            }));
            // Clear the ref after using it
            initialFormStateRef.current = undefined;
        }
    }, [productDetail, modalOpenTrigger]);

    useImperativeHandle(ref, () => ({
        open: (newProduct: Product, newQuantity = 1, formState?: Partial<FormState>) => {
            // Save initialFormState to ref for use in useEffect
            initialFormStateRef.current = formState;

            // Increment trigger to force useEffect to run
            setModalOpenTrigger(prev => prev + 1);

            // Set initial product and IDs for fetching detail
            setProduct(newProduct);
            setVendorId(newProduct.vendor_id);
            setProductId(newProduct.id);
            setForm({
                size: formState?.size || newProduct?.options?.size[0] || "",
                ice: formState?.ice || newProduct?.options?.ice[0] || "",
                sugar: formState?.sugar || newProduct?.options?.sugar[0] || "",
                quantity: newQuantity,
            });
            dialogRef.current?.open();
        },
        close: () => {
            dialogRef.current?.close();
            // Reset IDs and initialFormState when closing
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
            await onSubmit(form);
            dialogRef.current?.close();
        } finally {
            setPending(false);
        }
    };

    return (
        <Dialog ref={dialogRef}>
            <picture>
                <img src={product.image_url} />
            </picture>
            <form>
                {isLoadingDetail ? (
                    <div className={styles['loading']}>載入商品詳情中...</div>
                ) : (
                    <>
                        <header>
                            <div className={styles['name']}>{product.name}</div>
                            <div className={styles['price']}>NT ${product.price}</div>
                            <div className={styles['desc']}>{product.description}</div>
                        </header>
                        <div className={styles['content']}>
                            <OptionDropdown
                                id="size"
                                label="大小"
                                value={form.size}
                                options={product?.options?.size ?? []}
                                onChange={(val) => setForm({ ...form, size: val })}
                            />
                            <OptionDropdown
                                id="ice"
                                label="冰度"
                                value={form.ice}
                                options={product?.options?.ice ?? []}
                                onChange={(val) => setForm({ ...form, ice: val })}
                            />
                            <OptionDropdown
                                id="sugar"
                                label="甜度"
                                value={form.sugar}
                                options={product?.options?.sugar ?? []}
                                onChange={(val) => setForm({ ...form, sugar: val })}
                            />
                            <QuantityInput
                                value={form.quantity}
                                onChange={(val) => setForm({ ...form, quantity: val })}
                            />
                        </div>
                        <footer>
                            <button type="button" onClick={handleSubmit} disabled={pending || isLoadingDetail}>
                                {pending ? "處理中..." : submitText}
                            </button>
                        </footer>
                    </>
                )}
            </form>
        </Dialog>
    );
});

interface OptionDropdownProps {
    id: string;
    label: string;
    value: string;
    options: string[];
    onChange: (val: string) => void;
}

const OptionDropdown = ({ id, label, value, options, onChange }: OptionDropdownProps) => {
    return (
        <div className={styles['dropdown']}>
            <label htmlFor={id}>
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
            >
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}
