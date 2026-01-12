import React from "react";
import styles from "./VendorCard.module.scss";

interface VendorCardProps {
  name: string;
  logoUrl: string;
  description?: string;
  onClick?: () => void;
}

const VendorCard = React.memo(
  ({ name, logoUrl, description, onClick }: VendorCardProps) => {
    return (
      <article className={styles.card} onClick={onClick}>
        <div className={styles.logoWrapper}>
          <img src={logoUrl} alt={`${name} logo`} loading="lazy" />
        </div>
        <section className={styles.info}>
          <h2 className={styles.name}>{name}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </section>
      </article>
    );
  }
);

export default VendorCard;
