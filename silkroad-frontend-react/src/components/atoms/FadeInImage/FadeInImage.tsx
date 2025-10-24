import { useState } from "react";
import styles from "./FadeInImage.module.css";

interface FadeInImageProps {
	src: string;
	alt: string;
}

export default function FadeInImage({ src, alt }: FadeInImageProps) {
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
}