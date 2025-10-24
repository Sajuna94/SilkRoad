import { useState } from "react";
import styles from "./FadeInImage.module.css";
import React from "react";

interface FadeInImageProps {
	src: string;
	alt: string;
}

export const FadeInImage = React.memo(({ src, alt }: FadeInImageProps) => {
	const [loaded, setLoaded] = useState(false);
	return (
		<img
			src={src}
			alt={alt}
			loading="lazy"
			onLoad={() => setLoaded(true)}
			className={loaded ? styles.fadeIn : styles.hidden}
		/>
	);
});