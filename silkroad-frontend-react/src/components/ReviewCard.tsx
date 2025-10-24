import React, { useState } from "react";
import StarRating from "./StarRating";
import { useToast } from "../components/Toast";

export default function ReviewCard() {
	const { showToast } = useToast();
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState("");

	// Toast 狀態
	const [toast, setToast] = useState<{
		message: string;
		type: "success" | "error" | "info";
	} | null>(null);

	const handleSubmit = () => {
		if (!rating) {
			showToast("請給予星級評價！", "error");
			return;
		}

		showToast(`感謝您的評價！(${rating} 星)`, "success");
		setComment("");
		setRating(0);
	};

	// Toast 自動消失
	React.useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(null), 3000); // 3 秒後自動隱藏
			return () => clearTimeout(timer);
		}
	}, [toast]);

	return (
		<div className="w-full max-w-md shadow-lg rounded-2xl p-4 space-y-4 relative">
			<div className="CardHeader">
				<div className="CardTitle text-lg font-semibold text-gray-800">
					商品評價
				</div>
			</div>
			<div className="CardContent space-y-3">
				<StarRating initialRating={3.5} onRatingChange={setRating} />
				<textarea
					className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
					placeholder="寫下您的心得..."
					value={comment}
					onChange={(e) => setComment(e.target.value)}
				/>
				<button
					className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 rounded-lg"
					onClick={handleSubmit}
				>
					送出評價
				</button>
			</div>

			{/* Toast */}
			{/* {toast && <Toast message={toast.message} type={toast.type} />} */}
		</div>
	);
}
