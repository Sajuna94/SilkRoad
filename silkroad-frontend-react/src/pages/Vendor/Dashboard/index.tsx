<<<<<<< HEAD
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./index.module.scss"
import OrderTab from "./tabs/Order";
import OverviewTab from "./tabs/Overview";
import ProductTab from "./tabs/Product";

export default function VendorDashboardPage() {
	const navigate = useNavigate();
	const location = useLocation();
=======
// import React, { useEffect, useState } from "react";
// import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";

// const tabs = [
// 	{ id: "1", label: "Tab 1", content: "這是第一個 Tab 的內容" },
// 	{ id: "2", label: "Tab 2", content: "這是第二個 Tab 的內容" },
// 	{ id: "3", label: "Tab 3", content: "這是第三個 Tab 的內容" },
// ];
>>>>>>> e69977633e30250de3d3b4dcdbcdea74ab6ad374

	const tabs = [
		{ id: "1", label: "資訊總覽", element: <OverviewTab /> },
		{ id: "2", label: "商品管理", element: <ProductTab /> },
		{ id: "3", label: "訂單管理", element: <OrderTab /> },
	];

	const currentId = location.hash.replace("#", "") || tabs[0].id;

	return (
		<div className={styles['container']}>

			<aside>
				<ul>
					{tabs.map((t) => (
						<li key={t.id} onClick={() => navigate(`#${t.id}`)}>
							{t.label}
						</li>
					))}
				</ul>
			</aside>

			<main>
				{tabs.find((t) => t.id === currentId)?.element ?? null}
			</main>
		</div>
	);
}