import { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { FadeInImage } from "@/components/atoms/FadeInImage";
import ProductGallery from "@/components/organisms/ProductGallery/ProductGallery";
import StarRating from "@/components/atoms/StarRating";
import { useVendor, useVendorProductsByVendorId } from "@/hooks/auth/vendor";
import { useCurrentUser } from "@/hooks/auth/user";
import { useVendorReviews } from "@/hooks/store/review";
import styles from "./VendorPage.module.scss";

export default function VendorPage() {
  const navigate = useNavigate();
  const { vendorId } = useParams<{ vendorId: string }>();
  const vendorIdNum = vendorId ? parseInt(vendorId, 10) : 0;

  const { data: vendor, isLoading: isVendorLoading } = useVendor(vendorIdNum);
  const { data: products, isLoading: isProductsLoading } =
    useVendorProductsByVendorId(vendorIdNum);
  const { data: user } = useCurrentUser();

  const { data: reviews = [] } = useVendorReviews(vendorIdNum);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) /
        reviews.length
      : 0;

  useEffect(() => {
    if (vendor && !vendor.is_active) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [vendor, navigate]);

  if (isVendorLoading || isProductsLoading) {
    return (
      <div
        className={styles.pageContainer}
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        載入中...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div
        className={styles.pageContainer}
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        找不到店家
      </div>
    );
  }

  if (!vendor.is_active) {
    return (
      <div
        className={styles.pageContainer}
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h2>此店家目前已下架</h2>
        <p>將在 3 秒後自動返回首頁...</p>
        <button onClick={() => navigate("/home")} style={{ padding: "10px" }}>
          立即返回
        </button>
      </div>
    );
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
              <Link
                to={`/vendor/${vendorId}/reviews`}
                className={styles.ratingLink}
              >
                <div style={{ display: "inline-flex", alignItems: "center" }}>
                  <StarRating initialRating={avgRating} readonly size={16} />
                  <span style={{ marginLeft: 8 }}>
                    {reviews.length > 0 ? avgRating.toFixed(1) : "尚無評分"} (
                    {reviews.length} 評論)
                  </span>
                </div>
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
            </>
          ) : (
            <p>此店家暫無商品</p>
          )}
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
