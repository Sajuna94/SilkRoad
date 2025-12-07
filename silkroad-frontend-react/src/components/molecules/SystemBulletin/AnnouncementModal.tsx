import styles from "./AnnouncementModal.module.scss";

export interface Announcement {
  id: string;
  content: string;
  adminId: string;
  createdAt: string;
}

interface AnnouncementModalProps {
  data: Announcement | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AnnouncementModal({
  data,
  isOpen,
  onClose,
}: AnnouncementModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>
          &times;
        </button>

        <div className={styles.content}>
          <p>{data.content}</p>
        </div>

        <div className={styles.footer}>
          <span className={styles.meta}>Admin: {data.adminId}</span>
          <span className={styles.meta}>{data.createdAt}</span>
        </div>
      </div>
    </div>
  );
}
