import { Link } from "react-router-dom";
import { products } from "@/types/data/product";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import ReviewInput from "@/components/molecules/ReviewInput";
import styles from "./ProductList.module.scss";

export default function ProductList() {
  return (
    <>
      <main className={styles.pageContainer}>
        <section className={styles.bannerWrapper}>
          <VendorHeaderBarImage />
        </section>

        <header className={styles.vendorHeader}>
          <div className={styles.vendorInfo}>
            <h1>Vendor Name</h1>
            <div className={styles.meta}>
              <span>台北市信義區松壽路 1 號</span>
              <Link to="/vendor/reviews" className={styles.ratingLink}>
                <span>⭐ 4.8 (120 評論)</span>
              </Link>
            </div>
          </div>

          <div className={styles.actions}>
            <Link to={"/vendor/dashboard"} className={styles.dashboardBtn}>
              管理商家後台
            </Link>
          </div>
        </header>

        <section className={styles.productSection}>
          <h2 className={styles.sectionTitle}>熱門商品</h2>
          <ProductGallery products={products} pageSize={10} />
        </section>

        <section className={styles.reviewSection}>
          <h2 className={styles.sectionTitle}>撰寫評論</h2>
          <div>
            <ReviewInput />
          </div>
        </section>
      </main>
    </>
  );
}

function VendorHeaderBarImage() {
  return (
    <>
      <FadeInImage fullSrc="https://eventbotler.com/images/cocktails/shirley-temple-84bDzLRS.webp" />
    </>
  );
}
