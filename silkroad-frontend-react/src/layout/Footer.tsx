import styles from "@/layout/Footer.module.scss";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          © {new Date().getFullYear()} SilkRoad. All rights reserved.
        </div>

        <div className={styles.right}>
          <div className={styles.brand}>SilkRoad</div>
          <nav className={styles.links}>
            <a
              href="https://www.canva.com/design/DAG2srcWvXg/sBX9HgzAxDytv1BVgdnE_A/edit"
              target="_blank"
              rel="noopener noreferrer"
            >
              Canva
            </a>
            <a
              href="https://onedrive.live.com/personal/8a32e11b977cc753/_layouts/15/Doc.aspx?sourcedoc=%7B4f676aaa-a9d4-495d-84c6-f2819ef5ef35%7D&action=default&redeem=aHR0cHM6Ly8xZHJ2Lm1zL3cvYy84YTMyZTExYjk3N2NjNzUzL0VhcHFaMF9VcVYxSmhNYnlnWjcxN3pVQlh2ZlhVRGlrMExEdHJaaVlrU3k1cmc_ZT1sc0dTdGc&slrid=80e9d2a1-608b-0000-098f-f6b193ee6ac8&originalPath=aHR0cHM6Ly8xZHJ2Lm1zL3cvYy84YTMyZTExYjk3N2NjNzUzL0VhcHFaMF9VcVYxSmhNYnlnWjcxN3pVQlh2ZlhVRGlrMExEdHJaaVlrU3k1cmc_cnRpbWU9S3dEdkV1d1Qza2c&CID=f4694c94-c31c-4b88-8533-e69d448a5778&_SRM=0:G:38"
              target="_blank"
              rel="noopener noreferrer"
            >
              Specification
            </a>
            <a
              href="https://github.com/Sajuna94/SilkRoad"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
