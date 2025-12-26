import type { Product } from "@/types/store";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import styles from "./ProductEditModal.module.scss";
import { Dialog, type DialogRef } from "@/components/ui/Dialog";

export interface ProductEditModalRef {
    open: (product: Product) => void;
    close: () => void;
}

interface ProductEditModalProps {
    onSubmit?: (productId: number, formData: ProductEditFormData) => Promise<void> | void;
    onUpload?: (file: File) => Promise<string> | void;
}

export interface ProductEditFormData {
    name: string;
    price: number;
    description: string;
    image_url: string;
    size: string;
    sugar: string;
    ice: string;
}

export const ProductEditModal = forwardRef<ProductEditModalRef, ProductEditModalProps>(
    ({ onSubmit, onUpload }, ref) => {
        const dialogRef = useRef<DialogRef>(null);
        const [productId, setProductId] = useState<number>(0);
        const [form, setForm] = useState<ProductEditFormData>({
            name: "",
            price: 0,
            description: "",
            image_url: "",
            size: "",
            sugar: "",
            ice: "",
        });
        const [pending, setPending] = useState(false);
        const [uploading, setUploading] = useState(false);

        useImperativeHandle(ref, () => ({
            open: (product: Product) => {
                setProductId(product.id);
                setForm({
                    name: product.name,
                    price: product.price,
                    description: product.description || "",
                    image_url: product.image_url || "",
                    size: product.options?.size?.join(",") || "",
                    sugar: product.options?.sugar?.join(",") || "",
                    ice: product.options?.ice?.join(",") || "",
                });
                dialogRef.current?.open();
            },
            close: () => {
                dialogRef.current?.close();
            },
        }));

        const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (!file || !onUpload) return;

            try {
                setUploading(true);
                const url = await onUpload(file);
                if (url) {
                    setForm((prev) => ({ ...prev, image_url: url }));
                }
            } finally {
                setUploading(false);
            }
        };

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            if (!onSubmit) return;

            try {
                setPending(true);
                await onSubmit(productId, form);
                dialogRef.current?.close();
            } finally {
                setPending(false);
            }
        };

        return (
            <Dialog ref={dialogRef}>
                <form onSubmit={handleSubmit} className={styles.editForm}>
                    <header className={styles.header}>
                        <h2>編輯商品</h2>
                    </header>

                    <div className={styles.content}>
                        <div className={styles.formGroup}>
                            <label htmlFor="product-name">商品名稱</label>
                            <input
                                id="product-name"
                                type="text"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="product-price">商品價格</label>
                            <input
                                id="product-price"
                                type="number"
                                value={form.price}
                                onChange={(e) =>
                                    setForm({ ...form, price: Number(e.target.value) })
                                }
                                required
                                min="0"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="product-desc">商品描述</label>
                            <textarea
                                id="product-desc"
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                rows={3}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="product-size">大小選項 (逗號分隔)</label>
                            <input
                                id="product-size"
                                type="text"
                                value={form.size}
                                onChange={(e) => setForm({ ...form, size: e.target.value })}
                                placeholder="大杯,中杯,小杯"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="product-sugar">甜度選項 (逗號分隔)</label>
                            <input
                                id="product-sugar"
                                type="text"
                                value={form.sugar}
                                onChange={(e) => setForm({ ...form, sugar: e.target.value })}
                                placeholder="正常,半糖,微糖,無糖"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="product-ice">冰度選項 (逗號分隔)</label>
                            <input
                                id="product-ice"
                                type="text"
                                value={form.ice}
                                onChange={(e) => setForm({ ...form, ice: e.target.value })}
                                placeholder="正常冰,少冰,微冰,去冰"
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="product-image">圖片上傳</label>
                            <input
                                id="product-image"
                                type="file"
                                onChange={handleFileChange}
                                accept="image/*"
                                disabled={uploading}
                            />
                            {uploading && <span className={styles.uploading}>上傳中...</span>}
                            {form.image_url && (
                                <div className={styles.imagePreview}>
                                    <img src={form.image_url} alt="Preview" />
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className={styles.footer}>
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            className={styles.cancelBtn}
                            disabled={pending || uploading}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className={styles.submitBtn}
                            disabled={pending || uploading}
                        >
                            {pending ? "儲存中..." : "確認儲存"}
                        </button>
                    </footer>
                </form>
            </Dialog>
        );
    }
);
