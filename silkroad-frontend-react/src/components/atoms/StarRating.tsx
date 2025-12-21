import React, { useState, useEffect } from "react";

interface StarRatingProps {
  initialRating?: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  initialRating = 0,
  maxRating = 5,
  onRatingChange,
  readonly = false,
  size = 24,
}) => {
  const [rating, setRating] = useState<number>(initialRating);
  const [hoverRating, setHoverRating] = useState<number>(0);
  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = (index: number) => {
    if (readonly) return; // 唯讀模式下不處理點擊

    let newRating = index + 1;

    setRating(newRating);
    onRatingChange?.(newRating);
  };

  const handleMouseEnter = (index: number) => {
    if (!readonly) setHoverRating(index + 1);
  };

  const handleMouseLeave = () => {
    if (!readonly) setHoverRating(0);
  };

  const getStarState = (index: number): "filled" | "half" | "empty" => {
    const currentRating = hoverRating || rating;
    if (index + 1 <= currentRating) return "filled";
    if (index + 0.5 === currentRating) return "half";
    return "empty";
  };

  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const state = getStarState(index);
        return (
          <span
            key={index}
            onClick={() => handleClick(index)}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            style={{
              cursor: readonly ? "default" : "pointer",
              fontSize: `${size}px`,
              color: state === "empty" ? "#e0e0e0" : "#fbbf24",
              transition: "color 0.2s",
              lineHeight: 1,
            }}
          >
            <i
              className={`fa-star ${
                state === "filled" ? "fa-solid" : "fa-regular"
              }`}
            ></i>
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
