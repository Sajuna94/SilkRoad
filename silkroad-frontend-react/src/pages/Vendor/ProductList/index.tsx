import { Link, useParams } from "react-router-dom";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import ReviewInput from "@/components/molecules/ReviewInput/ReviewInput";
import { useVendor, useVendorProductsByVendorId } from "@/hooks/auth/vendor";
import { useCurrentUser } from "@/hooks/auth/user";
import styles from "./ProductList.module.scss";

export default function ProductList() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const vendorIdNum = vendorId ? parseInt(vendorId, 10) : undefined;

  const { data: vendor, isLoading: isVendorLoading } = useVendor(vendorIdNum!);
  const { data: products, isLoading: isProductsLoading } =
    useVendorProductsByVendorId(vendorIdNum);
  const { data: user } = useCurrentUser();

  if (isVendorLoading || isProductsLoading) {
    return <div className={styles.pageContainer}>載入中...</div>;
  }

  if (!vendor) {
    return <div className={styles.pageContainer}>找不到店家</div>;
  }

  return (
    <>
      <main className={styles.pageContainer}>
        <section className={styles.bannerWrapper}>
          <VendorHeaderBarImage />
        </section>

        <header className={styles.vendorHeader}>
          <div className={styles.vendorInfo}>
            <h1>{vendor.name}</h1>
            <div className={styles.meta}>
              <span>{vendor?.address || "地址未提供"}</span>
              <Link to="/vendor/reviews" className={styles.ratingLink}>
                <span>⭐ 4.8 (120 評論)</span>
              </Link>
            </div>
          </div>

          {user && user.role === "vendor" && (
            <div className={styles.actions}>
              <Link to={"/vendor/dashboard"} className={styles.dashboardBtn}>
                管理自家商家後台
              </Link>
            </div>
          )}
        </header>

        <section className={styles.productSection}>
          <h2 className={styles.sectionTitle}>熱門商品</h2>
          {products && products.length > 0 ? (
            <>
              <ProductGallery
                products={products.filter((p) => p.is_listed)}
                pageSize={10}
              />
              以下為下架商品 debug
              <ProductGallery
                products={products.filter((p) => !p.is_listed)}
                pageSize={10}
              />
            </>
          ) : (
            <p>此店家暫無商品</p>
          )}
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
