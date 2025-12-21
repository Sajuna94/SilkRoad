import { useAddProduct } from "@/hooks/auth/vendor";
import styles from "./Product.module.scss";
import { products } from "@/types/data/product";
import type { Product } from "@/types/store";
import React from "react";

export default function ProductTab() {
    const [initProducts, setProducts] = React.useState<Product[]>(products);
    const [form, setForm] = React.useState({
        name: "",
        price: 0,
        desc: "",
        options: {
            size: "",
            sugar: "",
            ice: "",
        },
        url: "",
    });

    const addProduct = useAddProduct();


    const toggleListed = (id: number) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, is_listed: !p.is_listed } : p))
        );
    };

    const handleAddProduct = () => {
        console.log(form);

        addProduct.mutate({
            name: "紅茶",
            price: 30,
            description: "古早味紅茶",
            options: {
                size: ["M", "L"],
                ice: ["正常冰", "少冰"],
                sugar: ["全糖", "半糖", "無糖"],
            },
            image_url: "https://...",
        });
    }

    return (
        <section className={styles["container"]}>
            <div className={styles["info"]}>
                <header>商品資訊</header>
                <div className={styles["content"]}>
                    <div style={{ flex: 1 }}>
                        <h4 className={styles["table-title"]}>上架專區</h4>
                        <ProductTable
                            products={initProducts.filter((p) => p.is_listed)}
                            onToggle={toggleListed}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4 className={styles["table-title"]}>下架專區</h4>
                        <ProductTable
                            products={initProducts.filter((p) => !p.is_listed)}
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
                        <label>商品名稱</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label>商品價格</label>
                        <input
                            value={form.price}
                            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                        />
                    </div>
                    <div>
                        <label>商品描述</label>
                        <input
                            value={form.desc}
                            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label>大小種類</label>
                        <input
                            value={form.options.size}
                            onChange={(e) => setForm((f) => ({ ...f, options: { ...f.options, size: e.target.value } }))}
                        />
                    </div>
                    <div>
                        <label>甜度種類</label>
                        <input
                            value={form.options.sugar}
                            placeholder="微冰,去冰"
                            onChange={(e) => setForm((f) => ({ ...f, options: { ...f.options, sugar: e.target.value } }))}
                        />
                    </div>
                    <div>
                        <label>冰度種類</label>
                        <input
                            value={form.options.ice}
                            onChange={(e) => setForm((f) => ({ ...f, options: { ...f.options, ice: e.target.value } }))}
                        />
                    </div>
                </div>
                <footer>
                    <button onClick={handleAddProduct}>確認新增</button>
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
                                    {p.is_listed ? "下架" : "上架"}
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
