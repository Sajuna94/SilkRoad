import type { Product } from "@/types/store";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import styles from "./ProductModal.module.scss"
import { Dialog, type DialogRef } from "@/components/ui/Dialog";
import { useInsertCartItem } from "@/hooks/order/cart";
import { QuantityInput } from "@/components/atoms/QuantityInput/QuantityInput";

export enum ModalMode {
    PREVIEW,
    ADD,
    EDIT,
}

export interface ModalRef {
    open: (mode: ModalMode, product: Product, quantity?: number) => void;
    close: () => void;
}

export const ProductModal = forwardRef<ModalRef, {}>((_, ref) => {
    // TODO: edit hook
    const insert = useInsertCartItem();

    const dialogRef = useRef<DialogRef>(null);
    const [mode, setMode] = useState<ModalMode>(ModalMode.PREVIEW);
    const [product, setProduct] = useState<Product>({} as Product);
    const [form, setForm] = useState({
        size: "", ice: "", sugar: "", quantity: 1,
    });

    useImperativeHandle(ref, () => ({
        open: (newMode: ModalMode, newProduct: Product, newQuantity = 1) => {
            console.log(newProduct);
            setMode(newMode);
            setProduct(newProduct);
            setForm({
                size: newProduct?.options?.size[0],
                ice: newProduct?.options?.ice[0],
                sugar: newProduct?.options?.sugar[0],
                quantity: newQuantity,
            });
            dialogRef.current?.open();
        },
        close: () => {
            dialogRef.current?.close();
        },
    }));

    const handleAddToCart = () => {
        console.log("Add: ", product, form);
    }

    const handleEditCartItem = () => {
        console.log("Edit: ", product, form);
    }

    return (
        <Dialog ref={dialogRef}>
            <picture>
                <img src={product.url} />
            </picture>
            <form>
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
                    {{
                        [ModalMode.PREVIEW]: (
                            <button type="button" onClick={() => dialogRef.current?.close()}>
                                關閉預覽
                            </button>
                        ),
                        [ModalMode.ADD]: (
                            <button type="button" onClick={handleAddToCart} disabled={insert.isPending}>
                                加入購物車
                            </button>
                        ),
                        [ModalMode.EDIT]: (
                            <button type="button" onClick={handleEditCartItem}>
                                儲存修改
                            </button>
                        ),
                    }[mode]}
                </footer>
            </form>
        </Dialog>
    )
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
