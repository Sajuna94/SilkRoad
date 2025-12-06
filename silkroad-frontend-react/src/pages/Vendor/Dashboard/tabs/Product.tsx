import styles from "./Product.module.scss";
import { products } from "@/types/data/product";
import type { Product } from "@/types/store";
import { useState } from "react";

export default function ProductTab() {
	const [initProducts, setProducts] = useState<Product[]>(products);

	const toggleListed = (id: number) => {
		setProducts((prev) =>
			prev.map((p) => (p.id === id ? { ...p, isListed: !p.isListed } : p))
		);
	};

	return (
		<section className={styles["container"]}>
			<div className={styles["info"]}>
				<header>商品資訊</header>
				<div className={styles["content"]}>
					<div style={{ flex: 1 }}>
						<h4 className={styles["table-title"]}>上架專區</h4>
						<ProductTable
							products={initProducts.filter((p) => p.isListed)}
							onToggle={toggleListed}
						/>
					</div>
					<div style={{ flex: 1 }}>
						<h4 className={styles["table-title"]}>下架專區</h4>
						<ProductTable
							products={initProducts.filter((p) => !p.isListed)}
							onToggle={toggleListed}
						/>
					</div>
				</div>
				<footer>
					<button>儲存</button>
				</footer>
			</div>
			<div className={styles["add"]}>
				<header>新增商品</header>
				<div className={styles["content"]}>
					<div>
						<div></div>
					</div>
				</div>
				<footer>
					<button>確認新增</button>
				</footer>
			</div>
		</section>
	);
}

function ProductTable({
	products,
	onToggle,
}: {
	products: Product[];
	onToggle: (id: number) => void;
}) {
	return (
		<div className={styles["table-wrapper"]}>
			<table>
				<thead>
					<tr>
						<th>名稱</th>
						<th style={{ width: "90px" }}>上/下架</th>
					</tr>
				</thead>
				<tbody>
					{products.map((p) => (
						<tr key={p.id}>
							<td>{p.name}</td>
							<td style={{ width: "90px" }}>
								<button onClick={() => onToggle(p.id)}>
									{p.isListed ? "下架" : "上架"}
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
