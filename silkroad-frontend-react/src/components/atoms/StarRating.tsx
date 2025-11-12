import React, { useState } from "react";

interface StarRatingProps {
	initialRating?: number;
	maxRating?: number;
	onRatingChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
	initialRating = 0,
	maxRating = 5,
	onRatingChange,
}) => {
	const [rating, setRating] = useState<number>(initialRating);
	const [hoverRating, setHoverRating] = useState<number>(0);
	const [clickState, setClickState] = useState<{
		lastClicked: number;
		count: number;
	}>({
		lastClicked: -1,
		count: 0,
	});

	const handleClick = (index: number) => {
		let newRating = rating;
		let newCount = clickState.count;

		if (clickState.lastClicked === index) {
			newCount = (clickState.count + 1) % 3;
		} else {
			newCount = 1;
		}

		if (newCount === 1) {
			newRating = index + 1; // 全星
		} else if (newCount === 2) {
			newRating = index + 0.5; // 半星
		} else {
			newRating = index; // 清空該星
		}

		setClickState({ lastClicked: index, count: newCount });
		setRating(newRating);
		onRatingChange?.(newRating);
	};

	const handleMouseEnter = (index: number) => setHoverRating(index + 1);
	const handleMouseLeave = () => setHoverRating(0);

	const getStarState = (index: number): "filled" | "half" | "empty" => {
		const currentRating = hoverRating || rating;
		if (index + 1 <= currentRating) return "filled";
		if (index + 0.5 === currentRating) return "half";
		return "empty";
	};

	return (
		<div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
			{Array.from({ length: maxRating }).map((_, index) => {
				const state = getStarState(index);
				return (
					<span
						key={index}
						onClick={() => handleClick(index)}
						onMouseEnter={() => handleMouseEnter(index)}
						onMouseLeave={handleMouseLeave}
						style={{
							cursor: "pointer",
							fontSize: "28px",
							color: state === "empty" ? "gray" : "gold",
						}}
					>
						{state === "filled" && <i className="fa-solid fa-star"></i>}
						{state === "half" && (
							<i className="fa-regular fa-star-half-stroke"></i>
						)}
						{state === "empty" && <i className="fa-regular fa-star"></i>}
					</span>
				);
			})}
		</div>
	);
};

export default StarRating;
