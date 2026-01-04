import VendorList, {
    type Vendor as VendorCard,
} from "@/components/molecules/VendorList";
import SystemBulletin from "@/components/molecules/SystemBulletin/SystemBulletin";
import {
    // useAllVendors,
    useAllAnnouncements,
    type Announcement as ApiAnnouncement,
} from "@/hooks/auth/admin";
import {
    useVendors
} from "@/hooks/auth/vendor";
import type {
    Announcement as BulletinAnnouncement,
} from "@/components/molecules/SystemBulletin/AnnouncementModal";
import { useMemo, useState } from "react";

export default function Home() {
    const { data: vendorData } = useVendors();
    const { data: apiAnnouncements } = useAllAnnouncements();

    // Vendor mapping
    const vendors: VendorCard[] =
        vendorData
            // ?.filter((v) => true)
            ?.map((v) => ({
                id: String(v.id),
                name: v.name,
                description: v.description,
                // Use the logo_url from vendor data
                logoUrl: v.logo_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${v.id}`, // Fallback to a default if logo_url is not available
            })) ?? [];

    // Searching
    const [searchText, setSearchText] = useState("");
    const filteredVendors = useMemo(() =>
        vendors.filter(v =>
            searchText === "" || v.name.toLowerCase().includes(searchText.toLowerCase())
        ),
        [vendors, searchText]
    );

    // Announcement mapping
    const announcements: BulletinAnnouncement[] =
        apiAnnouncements?.map((a: ApiAnnouncement) => ({
            id: String(a.id),
            content: a.message,
            adminId: String(a.admin_name),
            createdAt: a.created_at,
        })) ?? [];

    return (
        <div style={{ padding: "2rem", height: "100%", overflowY: "auto" }}>
            <SystemBulletin announcements={announcements} />
            <hr />
            <input
                type="text"
                placeholder="搜尋店家"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); }}
            />
            <VendorList vendors={filteredVendors} />
        </div>
    );
}
