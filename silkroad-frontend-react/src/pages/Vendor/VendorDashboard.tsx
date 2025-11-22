import { products } from "@/types/data/product";
import styles from "./Dashboard.module.scss"
import { useRef, useState } from "react";
import { ProductModal, type ProductModalRef } from "@/components/molecules/ProductModal/ProductModal";
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
	const [productsList, setProducts] = useState<Product[]>(products);
	const modalRef = useRef<ProductModalRef>(null);

	const toggleListed = (id: number) => {
		setProducts(prev =>
			prev.map(item =>
				item.id === id ? { ...item, isListed: !item.isListed } : item
			)
		);
	};

	return (<section className={styles['product-info']}>
		<header></header>
		<div className={styles['product-list']}>
			<table>
				<thead>
					<tr>
						<th>商品名稱</th>
						<th colSpan={2}>上架狀態</th>
						{/* <th colSpan={2}>aaa</th> */}
					</tr>
				</thead>
				<tbody>
					{productsList.filter(item => item.isListed).map((item, index) => (
						<tr key={index}>
							<td>{item.name}</td>
							{/* <td>{item.isListed ? "上架" : "下架"}</td> */}
							<td>
								<button onClick={() => toggleListed(item.id)}>下架</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<table>
				<thead>
					<tr>
						<th>商品名稱</th>
						<th >上下架</th>
						{/* <th colSpan={2}>aaa</th> */}
					</tr>
				</thead>
				<tbody>
					{productsList.filter(item => !item.isListed).map((item, index) => (
						<tr key={index}>
							<td>{item.name}</td>
							{/* <td>{item.isListed ? "上架" : "下架"}</td> */}
							<td>
								<button onClick={() => toggleListed(item.id)}>上架</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			<ul>
				<li></li>
			</ul>
			<ProductModal ref={modalRef} />
		</div>
	</section>)
}


function NewProduct() {
	const product = {} as Product;
	const modalRef = useRef<ProductModalRef>(null);

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
					<label>名稱</label>
					<input value={form.name}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
					/>
				</div>
				<div style={{ display: "flex" }}>
					<label>價格</label>
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
				onClick={() => modalRef.current?.open({
					...product,
					name: form.name,
					price: form.price
				})}
			/>
		</div>
		<ProductModal ref={modalRef} />
	</section>);
}

