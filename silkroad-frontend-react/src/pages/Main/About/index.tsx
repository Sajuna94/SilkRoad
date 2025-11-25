import styles from "./About.module.scss";

export default function About() {
    return (
        <div className={styles.page}>
            <section className={styles.banner}>
                <img src="/SilkRoad/images/banner.jpg" alt="SilkRoad Banner" />
                <div className={styles.title}>
                    <h1 className={styles.animateFadeIn}>關於 SilkRoad</h1>
                </div>
            </section>

            <div className={styles.wrapper}>
                <section className={styles.twoColumn}>
                    <div className={styles.animateSlideUp}>
                        <h2 className={styles.sectionTitle}>更便利的飲品訂購方式</h2>

                        <p className={styles.paragraph}>
                            SilkRoad
                            是一個強調顧客體驗的現代化線上飲品平台，讓您能快速瀏覽飲品、
                            自由客製化、便捷結帳並追蹤外送進度。不論您喜歡手搖飲或是想嘗試新品牌，
                            SilkRoad 都能提供最方便的選擇。
                        </p>

                        <p className={styles.paragraph}>
                            從飲品上架、銷售、付款，到配送流程，SilkRoad
                            全面整合線上訂購體驗，
                            讓整個流程更順暢、透明且高效，省去排隊與等待的時間。
                        </p>

                        <p className={styles.paragraph}>
                            我們與店家共同合作並透過後台系統維持平台的安全與公平性，
                            確保每位顧客都能享受穩定、可靠且值得信賴的服務。
                        </p>
                    </div>

                    {/* Right Image */}
                    <div className={styles.animateFadeIn}>
                        <img src="/SilkRoad/images/showcase.jpg" alt="Beverage showcase" />
                    </div>
                </section>

                <section className={styles.features}>
                    <div
                        className={`${styles.featureBox} ${styles.animateSlideUp} ${styles.delay75}`}
                    >
                        <h3>輕鬆訂購</h3>
                        <p>瀏覽飲品、客製化你的飲料，幾秒內即可完成結帳。</p>
                    </div>

                    <div
                        className={`${styles.featureBox} ${styles.animateSlideUp} ${styles.delay150}`}
                    >
                        <h3>多種品項，任君挑選</h3>
                        <p>探索熱門店家，或發掘你附近的新品牌。</p>
                    </div>

                    <div
                        className={`${styles.featureBox} ${styles.animateSlideUp} ${styles.delay300}`}
                    >
                        <h3>可靠的外送</h3>
                        <p>從結帳到送達家門，全程即時追蹤你的訂單。</p>
                    </div>
                </section>
            </div>
        </div>
    );
}
