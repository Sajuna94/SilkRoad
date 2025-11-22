import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation, useNavigate } from "react-router-dom";

const tabs = [
	{ id: "1", label: "Tab 1", content: "這是第一個 Tab 的內容" },
	{ id: "2", label: "Tab 2", content: "這是第二個 Tab 的內容" },
	{ id: "3", label: "Tab 3", content: "這是第三個 Tab 的內容" },
];

// function Sidebar() {
// 	const navigate = useNavigate();
// 	const location = useLocation();
// 	const currentTab = location.hash.replace("#", "") || "1";

// 	return (
// 		<div style={{ width: "200px", borderRight: "1px solid #ccc" }}>
// 			{tabs.map((tab) => (
// 				<div
// 					key={tab.id}
// 					style={{
// 						padding: "10px",
// 						cursor: "pointer",
// 						background: currentTab === tab.id ? "#eee" : "transparent",
// 					}}
// 					onClick={() => navigate(`/panel#${tab.id}`)}
// 				>
// 					{tab.label}
// 				</div>
// 			))}
// 		</div>
// 	);
// }

// function Panel() {
// 	const location = useLocation();
// 	const [currentTab, setCurrentTab] = useState("1");

// 	useEffect(() => {
// 		const hash = location.hash.replace("#", "");
// 		setCurrentTab(hash || "1");
// 	}, [location]);

// 	const tab = tabs.find((t) => t.id === currentTab);

// 	return (
// 		<div style={{ padding: "20px" }}>
// 			<h2>{tab?.label}</h2>
// 			<p>{tab?.content}</p>
// 		</div>
// 	);
// }

export default function Dashboard() {
	return (
		<div>
			
		</div>
	);
}