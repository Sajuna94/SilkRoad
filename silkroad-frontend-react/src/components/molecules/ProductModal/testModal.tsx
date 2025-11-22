
// import styles from "./ProductModal.module.scss";
// import { useNavigate } from "react-router-dom";
// import { forwardRef, useImperativeHandle, useState, type JSX } from "react";
// import type { Product } from "@/types/store";
// import { QuantityInput } from "@/components/atoms/QuantityInput/QuantityInput";
// import { useInsertCartItem } from "@/hooks/order/cart";

// export type ProductModalMode = "ADD" | "EDIT";

// interface ProductModalProps {
//     mode?: ProductModalMode; // 是否為修改模式
// }

// export interface ProductModalRef {
//     open: (product: Product, quantity?: number) => void;
//     close: () => void;
// }

// const initForm = (product?: Product, quantity = 1) => ({
//     size: product?.options?.size?.[0] ?? "",
//     sugar: product?.options?.sugar?.[0] ?? "",
//     ice: product?.options?.ice?.[0] ?? "",
//     quantity,
// });

// export const ProductModal = forwardRef<ProductModalRef, ProductModalProps>((props, ref) => {
//     const navigate = useNavigate();
//     const insertCartItem = useInsertCartItem();

//     // Modal state
//     const [open, setOpen] = useState(false);
//     const [product, setProduct] = useState<Product | null>(null);

//     // Expose open and close methods via ref
//     useImperativeHandle(ref, () => ({
//         open: (product: Product, quantity?: number) => {
//             setProduct(product);
//             setForm(initForm(product, quantity));
//             setOpen(true);
//         },
//         close: () => setOpen(false),
//     }));

//     // Form state

//     const [form, setForm] = useState(() => initForm());

//     if (!open || !product) return null;


//     const handleAddToCart = () => {
//         insertCartItem.mutate({
//             productId: product.id,
//             quantity: form.quantity,
//             options: {
//                 size: form.size,
//                 sugar: form.sugar,
//                 ice: form.ice,
//             },
//         }, {
//             onSuccess: (data) => {
//                 console.log("Add to cart:", data);
//                 navigate("/cart");
//             },
//             onError: () => {
//                 console.log("From:", form)
//             },
//         });
//     }

//     const handleEditSubmit = () => {
//         // Handle edit mode submission
//         console.log("Edit submit:", form);
//     };

//     const submitButtons: Record<ProductModalMode, JSX.Element> = {
//         ADD: <button className={styles['btn']}>加入購物車</button>,
//         EDIT: <button className={styles['btn']}>修改</button>,
//     };


//     return (
//         <section className={styles.overlay} onClick={() => setOpen(false)}>
//             <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
//                 {/* Modal content goes here */}
//                 <div className={styles.area}>
//                     <img src={product.url} />
//                 </div>

//                 <div className={styles.content}>
//                     <h1 className={styles.name}>{product.name}</h1>
//                     <p className={styles.price}>NT ${product.price}</p>
//                     <p className={styles.description}>{product.description}</p>
//                     {/* Additional form fields and buttons can be added here */}

//                     <OptionDropdown
//                         id="size"
//                         label="大小"
//                         value={form.size}
//                         options={product.options?.size ?? []}
//                         onChange={(val) => setForm({ ...form, size: val })}
//                     />

//                     <OptionDropdown
//                         id="sugar"
//                         label="糖度"
//                         value={form.sugar}
//                         options={product.options?.sugar ?? []}
//                         onChange={(val) => setForm({ ...form, sugar: val })}
//                     />

//                     <OptionDropdown
//                         id="ice"
//                         label="冰度"
//                         value={form.ice}
//                         options={product.options?.ice ?? []}
//                         onChange={(val) => setForm({ ...form, ice: val })}
//                     />

//                     <QuantityInput
//                         value={form.quantity}
//                         onChange={(value) => setForm({ ...form, quantity: value })}
//                     />


//                     <button className={styles['submit']} onClick={ }></button>
//                     {props.mode ? (
//                         <button className={styles.submit} onClick={handleEditSubmit}>修改完成</button>
//                     ) : (
//                         <button className={styles.submit} onClick={handleAddToCart} disabled={insertCartItem.isPending}>加入購物車</button>
//                     )}
//                 </div>
//             </div>
//         </section>
//     )
// });

// interface OptionDropdownProps {
//     id: string;
//     label: string;
//     value: string;
//     options: string[];
//     onChange: (val: string) => void;
// }

// function OptionDropdown({ id, label, value, options, onChange }: OptionDropdownProps) {
//     return (
//         <div className={styles.dropdown}>
//             <label htmlFor={id}>{label}</label>
//             <select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
//                 {options.map((option) => (
//                     <option key={option} value={option}>
//                         {option}
//                     </option>
//                 ))}
//             </select>
//         </div>
//     );
// }


