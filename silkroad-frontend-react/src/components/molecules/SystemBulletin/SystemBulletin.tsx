import { useState } from "react";
import styles from "./SystemBulletin.module.scss";
import AnnouncementModal, { type Announcement } from "./AnnouncementModal";

interface SystemBulletinProps {
  announcements: Announcement[];
}

export default function SystemBulletin({ announcements }: SystemBulletinProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<Announcement | null>(null);

  // 取最新的一則
  const latestAnnouncement = announcements[0];

  const handleOpenModal = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const handleCloseModal = () => {
    setSelectedAnnouncement(null);
  };

  if (announcements.length === 0) return null;

  return (
    <>
      <div
        className={`${styles.bulletinContainer} ${
          isExpanded ? styles.expanded : ""
        }`}
      >
        <div className={styles.headerRow}>
          {/* 小喇叭 Icon */}
          <div className={styles.iconArea}>
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M11 5L6 9H2V15H6L11 19V5Z" />
              <path d="M15.54 8.46C16.47 9.39 17 10.63 17 12C17 13.37 16.47 14.61 15.54 15.54L14.12 14.12C14.68 13.56 15 12.81 15 12C15 11.19 14.68 10.44 14.12 9.88L15.54 8.46Z" />
              <path d="M18.36 5.64L16.95 7.05C18.25 8.35 19 10.09 19 12C19 13.91 18.25 15.65 16.95 16.95L18.36 18.36C20.06 16.66 21 14.41 21 12C21 9.59 20.06 7.34 18.36 5.64Z" />
            </svg>
          </div>

          <div
            className={styles.messageArea}
            onClick={() => handleOpenModal(latestAnnouncement)}
          >
            <span className={styles.tag}>NEW</span>
            <span className={styles.text}>{latestAnnouncement.content}</span>
          </div>

          <button
            className={styles.toggleBtn}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={
              isExpanded ? "Close announcements" : "Show announcements"
            }
          >
            <svg
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              fill="none"
              width="20"
              height="20"
              style={{
                transition: "transform 0.3s ease",
                transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              }}
            >
              {isExpanded ? (
                /* X Icon (Close) */
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                /* Hamburger Icon (Menu) */
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>

        {isExpanded && (
          <div className={styles.listArea}>
            {announcements.map((item) => (
              <div
                key={item.id}
                className={styles.listItem}
                onClick={() => handleOpenModal(item)}
              >
                <span className={styles.date}>{item.createdAt}</span>
                <span className={styles.text}>{item.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <AnnouncementModal
        isOpen={!!selectedAnnouncement}
        data={selectedAnnouncement}
        onClose={handleCloseModal}
      />
    </>
  );
}
