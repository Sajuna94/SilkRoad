import VendorList, {
    type Vendor as VendorCard,
} from "@/components/molecules/VendorList";
import SystemBulletin from "@/components/molecules/SystemBulletin/SystemBulletin";
import {
    useAllVendors,
    useAllAnnouncements,
    type Announcement as ApiAnnouncement,
} from "@/hooks/auth/admin";
import {
    useVendors
} from "@/hooks/auth/vendor";
import type {
    Announcement as BulletinAnnouncement,
} from "@/components/molecules/SystemBulletin/AnnouncementModal";

export default function Home() {
    const { data: vendorData } = useVendors();
    const { data: apiAnnouncements } = useAllAnnouncements();

    // Vendor mapping
    const vendors: VendorCard[] =
        vendorData
            ?.filter((v) => true)
            .map((v) => ({
                id: String(v.id),
                name: v.name,
                description: v.description,
                logoUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${v.id}`,
            })) ?? [];

    // Announcement mapping
    const announcements: BulletinAnnouncement[] =
        apiAnnouncements?.map((a: ApiAnnouncement) => ({
            id: String(a.id),
            content: a.message,
            adminId: String(a.admin_id),
            createdAt: a.created_at,
        })) ?? [];

    return (
        <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
            <SystemBulletin announcements={announcements} />
            <hr />
            <VendorList vendors={vendors} />
        </div>
    );
}
