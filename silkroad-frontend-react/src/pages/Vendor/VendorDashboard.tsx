import { products } from "@/types/data/product";
import styles from "./Dashboard.module.scss"
import { useRef, useState } from "react";
import { ModalMode, ProductModal, type ModalRef } from "@/components/molecules/ProductModal/ProductModal";
import type { Product } from "@/types/store";
import { useCloudinaryUpload } from "@/hooks/utils/cloudinary";
import ProductCard from "@/components/molecules/ProductCard/ProductCard";

export interface Vendor {
    name: string,
    balance: number,
}


export default function VendorDashboard() {
    return (
        <>
            <ControlPanel />
        </>
    );
}

function ControlPanel() {
    const tabs = [
        { key: "profile", label: "店家資訊", component: <Profile /> },
        { key: "orderInfo", label: "訂單紀錄", component: <OrderInfo /> },
        { key: "productInfo", label: "商品資訊", component: <ProductInfo /> },
        { key: "newProduct", label: "新增商品", component: <NewProduct /> },
    ];
    const [activeTab, setActiveTab] = useState(tabs[0].key);

    return (
        <section className={styles['container']}>
            <div className={styles['sidebar']}>
                {tabs.map((tab) => (
                    <h3
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={activeTab === tab.key ? styles['active'] : ""}
                    >
                        {tab.label}
                    </h3>
                ))}
            </div>
            <div className={styles['content']}>
                {tabs.find((tab) => tab.key === activeTab)?.component}
            </div>
        </section>
    );
}

function Profile() {
    const vendor = {
        name: "test",
        balance: 21
    } as Vendor;
    return (<section className={styles['profile']}>
        <h3>店家資訊</h3>
        <h3>店家名稱{vendor.name}</h3>
        <div>營業額：{vendor.balance}</div>
    </section>);
}

function OrderInfo() {
    return (<section className={styles['order-info']}>
    </section>)
}


function ProductInfo() {
    const modalRef = useRef<ModalRef>(null);

    return (<section className={styles['product-info']}>
        <header></header>
        <ul className={styles['list']}>
            {products.map((item, index) => (
                <li key={index} className={styles['item']}>
                    <h3>{item.name}</h3>
                    <div className={styles['buttons']}>
                        {/* <button onClick={() => modalRef.current?.open(ModalMode.EDIT, item)}>修改</button> */}
                        <button>上架</button>
                        <button>下架</button>
                    </div>
                </li>
            ))}
        </ul>
        <ProductModal ref={modalRef} />
    </section>)
}

function NewProduct() {
    const product = {} as Product;
    const modalRef = useRef<ModalRef>(null);

    const [form, setForm] = useState({
        name: "", price: 0
    });
    const upload = useCloudinaryUpload();

    return (<section className={styles['new-product']}>
        <header style={{ display: "flex" }}>
            <h3>新增商品</h3>
        </header>
        <div style={{ display: "flex" }}>
            <form>
                <div style={{ display: "flex" }}>
                    <div>名稱</div>
                    <input value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                </div>
                <div style={{ display: "flex" }}>
                    <div>價格</div>
                    <input type="number" value={form.price}
                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    />
                </div>
                <div style={{ display: "flex" }}>
                    <button type="button" disabled={upload.isPending}>設置圖片</button>
                    <div>(小於 10MB)</div>
                </div>
            </form>
            <ProductCard
                name={form.name}
                price={form.price}
                img={upload.data?.secure_url || ""}
                onClick={() => modalRef.current?.open(ModalMode.PREVIEW, {
                    ...product,
                    name: form.name,
                    price: form.price
                })}
            />
        </div>
        <ProductModal ref={modalRef} />
    </section>);
}

