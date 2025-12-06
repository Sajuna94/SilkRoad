import styles from "./Product.module.scss";
import { products } from "@/types/data/product";
import type { Product } from "@/types/store";
import { useState } from "react";

export default function ProductTab() {
<<<<<<< HEAD
	const [stateProducts, setProducts] = useState<Product[]>(products);


	const toggleListed = (id: number) => {
		setProducts(prev =>
			prev.map(p =>
				p.id === id ? { ...p, isListed: !p.isListed } : p
			)
		);
	};

	const listed = stateProducts.filter(p => p.isListed);
	const unlisted = stateProducts.filter(p => !p.isListed);
	const max = Math.max(listed.length, unlisted.length);

	return (<section className={styles['container']}>
		<div className={styles['info']}>
			<header>
				商品資訊
			</header>
			<div className={styles['content']}>
				<table>
					<thead>
						<tr>
							<th colSpan={2}>上架商品</th>
							<th colSpan={2}>下架商品</th>
						</tr>
					</thead>
					<tbody>
						{Array.from({ length: max }).map((_, i) => {
							const lp = listed[i];
							const rp = unlisted[i];

							return (
								<tr key={i}>
									<td>
										{lp?.name ?? ""}
									</td>
									<td className={styles['tb-btn']}>
										{lp && <button onClick={() => toggleListed(lp.id)}>下架</button>}
									</td>

									<td>{rp?.name ?? ""}</td>
									<td className={styles['tb-btn']}>
										{rp && <button onClick={() => toggleListed(rp.id)}>上架</button>}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
			<footer><button>
				儲存
			</button></footer>
		</div>
		<div className={styles['add']}>
			<header>
				新增商品
			</header>
			<div className={styles['content']}>
				<div>
					<div></div>
=======
  const [initProducts, setProducts] = useState<Product[]>(products);

  const toggleListed = (id: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isListed: !p.isListed } : p))
    );
  };
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a

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

<<<<<<< HEAD
// function ProductTable({ products, onToggle }: {
// 	products: Product[];
// 	onToggle: (id: number) => void;
// }) {
// 	return (
// 		<table>
// 			<thead>
// 				<tr>
// 					<th>名稱</th>
// 					<th style={{ width: "90px" }}>上/下架</th>
// 				</tr>
// 			</thead>
// 			<tbody>
// 				{products.map((p) => (
// 					<tr key={p.id}>
// 						<td>{p.name}</td>
// 						<td style={{ width: "90px" }}>
// 							<button onClick={() => onToggle(p.id)}>
// 								{p.isListed ? "下架" : "上架"}
// 							</button>
// 						</td>
// 					</tr>
// 				))}
// 			</tbody>
// 		</table>
// 	);
// }
=======
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
>>>>>>> cc870e0d6ba37e9c1663d88f766e07dd6595bc5a
