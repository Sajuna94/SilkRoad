import React, { useEffect, useState } from "react";
import styles from "./FadeInImage.module.scss";

interface FadeInImageProps {
  previewSrc?: string;
  fullSrc: string;
  alt?: string;
  fade?: boolean; // 是否漸變
}

export const FadeInImage = React.memo(
  ({ previewSrc, fullSrc, alt }: FadeInImageProps) => {
    const [currentSrc, setCurrentSrc] = useState(previewSrc || "");
    const [loaded, setLoaded] = useState(Boolean(previewSrc));

    useEffect(() => {
      const img = new Image();
      img.src = fullSrc;
      img.onload = () => {
        setCurrentSrc(fullSrc);
        setLoaded(true);
      };
    }, [fullSrc]);

    return (
      <div className={`${styles.wrapper} ${loaded ? styles.loaded : ""}`}>
        <img
          src={currentSrc || fullSrc}
          alt={alt}
          className={`${styles.image} ${loaded ? styles.loaded : ""}`}
          loading="lazy"
        />
      </div>
    );
  }
);
