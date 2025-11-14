import styles from "./ProductModal.module.css";
import { useNavigate } from "react-router-dom";
import { forwardRef, useImperativeHandle, useState } from "react";
import type { Product } from "@/types/store";
import { QuantityInput } from "@/components/atoms/QuantityInput/QuantityInput";
import { useInsertCartItem } from "@/hooks/order/cart";

interface ProductModalProps {
	isEditMode?: boolean; // 是否為修改模式
	quantity?: number;
	note?: string;
}

export interface ProductModalRef {
	open: (product: Product) => void;
	close: () => void;
}

export const ProductModal = forwardRef<ProductModalRef, ProductModalProps>((props, ref) => {
	const navigate = useNavigate();
	const insertCartItem = useInsertCartItem();

	// Modal state
	const [open, setOpen] = useState(false);
	const [product, setProduct] = useState<Product | null>(null);

	// Expose open and close methods via ref
	useImperativeHandle(ref, () => ({
		open: (product: Product) => {
			setProduct(product);
			setForm(initForm(product));
			setOpen(true);
		},
		close: () => setOpen(false),
	}));

	// Form state
	const initForm = (product?: Product) => ({
		size: product?.options?.size?.[0] || "",
		sugar: product?.options?.sugar?.[0] || "",
		ice: product?.options?.ice?.[0] || "",
		quantity: props.quantity || 1,
		note: props.note || "",
	});
	const [form, setForm] = useState(() => initForm());

	if (!open || !product) return null;


	const handleAddToCart = () => {
		insertCartItem.mutate({
			productId: product.id,
			quantity: form.quantity,
			options: {
				size: form.size,
				sugar: form.sugar,
				ice: form.ice,
			},
		}, {
			onSuccess: () => {
				console.log("Add to cart:", insertCartItem.data);
				navigate("/cart");
			},
			onError: () => {
				console.log("From:", form)
			},
		});
	}

	const handleEditSubmit = () => {
		// Handle edit mode submission
		console.log("Edit submit:", form);
	};

	return (
		<section className={styles.overlay} onClick={() => setOpen(false)}>
			<div className={styles.modal} onClick={(e) => e.stopPropagation()}>
				{/* Modal content goes here */}
				<div className={styles.area}>
					<img src={product.url} />
				</div>

				<div className={styles.content}>
					<h1 className={styles.name}>{product.name}</h1>
					<p className={styles.price}>NT ${product.price}</p>
					<p className={styles.description}>{product.description}</p>
					{/* Additional form fields and buttons can be added here */}

					<OptionDropdown
						id="size"
						label="大小"
						value={form.size}
						options={product.options?.size ?? []}
						onChange={(val) => setForm({ ...form, size: val })}
					/>

					<OptionDropdown
						id="sugar"
						label="糖度"
						value={form.sugar}
						options={product.options?.sugar ?? []}
						onChange={(val) => setForm({ ...form, sugar: val })}
					/>

					<OptionDropdown
						id="ice"
						label="冰度"
						value={form.ice}
						options={product.options?.ice ?? []}
						onChange={(val) => setForm({ ...form, ice: val })}
					/>

					<QuantityInput
						value={form.quantity}
						onChange={(value) => setForm({ ...form, quantity: value })}
					/>

					{props.isEditMode ? (
						<button className={styles.submit} onClick={handleEditSubmit}>修改完成</button>
					) : (
						<button className={styles.submit} onClick={handleAddToCart} disabled={insertCartItem.isPending}>加入購物車</button>
					)}
				</div>
			</div>
		</section>
	)
});

interface OptionDropdownProps {
	id: string;
	label: string;
	value: string;
	options: string[];
	onChange: (val: string) => void;
}

function OptionDropdown({ id, label, value, options, onChange }: OptionDropdownProps) {
	return (
		<div className={styles.dropdown}>
			<label htmlFor={id}>{label}</label>
			<select id={id} value={value} onChange={(e) => onChange(e.target.value)}>
				{options.map((option) => (
					<option key={option} value={option}>
						{option}
					</option>
				))}
			</select>
		</div>
	);
}


// export default function ProductModal({
// 	isEditMode = false,
// 	product,
// 	quantity = 1,
// 	note = "",
// }: ProductModalProps) {
// 	const navigate = useNavigate();

// 	// 狀態管理
// 	const [form, setForm] = useState({
// 		size: product.options?.size?.[0] || "",
// 		sugar: product.options?.sugar?.[0] || "",
// 		ice: product.options?.ice?.[0] || "",
// 		quantity: quantity,
// 		note: note,
// 	});

// 	const handleSubmit = () => {
// 		if (!isEditMode) {
// 			navigate("/cart");
// 			return;
// 		}
// 	};

// 	// fake data for options
// 	if (!product.options) {
// 		product.options = {
// 			size: ["小", "中", "大"],
// 			sugar: ["無糖", "少糖", "正常糖"],
// 			ice: ["去冰", "微冰", "少冰", "正常冰"],
// 		};
// 	}

// 	return (
// 		<section className={styles.modal}>
// 			<div className={styles.imageArea}>
// 				<FadeInImage fullSrc={product.imageUrl} alt={product.name} />
// 			</div>

// 			<div className={styles.content}>
// 				<h1 className={styles.name}>{product.name}</h1>
// 				<p className={styles.price}>NT ${product.price}</p>
// 				<p className={styles.description}>{product.description}</p>

// 				<div className={styles.dropdown}>
// 					<label htmlFor="size">大小</label>
// 					<select
// 						id="size"
// 						value={form.size}
// 						onChange={(e) => setForm({ ...form, size: e.target.value })}
// 					>
// 						{product.options?.size?.map((sizeOption) => (
// 							<option key={sizeOption} value={sizeOption}>
// 								{sizeOption}
// 							</option>
// 						))}
// 					</select>
// 				</div>
// 				<div className={styles.dropdown}>
// 					<label htmlFor="ice">冰度</label>
// 					<select
// 						id="ice"
// 						value={form.ice}
// 						onChange={(e) => setForm({ ...form, ice: e.target.value })}
// 					>
// 						{product.options?.ice?.map((iceOption) => (
// 							<option key={iceOption} value={iceOption}>
// 								{iceOption}
// 							</option>
// 						))}
// 					</select>
// 				</div>
// 				<div className={styles.dropdown}>
// 					<label htmlFor="sugar">糖度</label>
// 					<select
// 						id="sugar"
// 						value={form.sugar}
// 						onChange={(e) => setForm({ ...form, sugar: e.target.value })}
// 					>
// 						{product.options?.sugar?.map((sugarOption) => (
// 							<option key={sugarOption} value={sugarOption}>
// 								{sugarOption}
// 							</option>
// 						))}
// 					</select>
// 				</div>

// 				<QuantityInput
// 					value={form.quantity}
// 					onChange={(value) => setForm({ ...form, quantity: value })}
// 				/>

// 				<button className={styles.submitButton} onClick={handleSubmit}>
// 					{isEditMode ? "修改完成" : "加入購物車"}
// 				</button>

// 				{/* --- 客製化選項區 --- */}
// 				<div className={styles.options}>
// 					{/* <label>
// 						備註：
// 						<textarea
// 							value={note}
// 							onChange={(e) => setNote(e.target.value)}
// 							placeholder="例如：不要吸管、去冰少糖..."
// 							className={styles.noteArea}
// 						/>
// 					</label> */}
// 				</div>
// 			</div>
// 		</section>
// 	);
// }
