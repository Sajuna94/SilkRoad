import { useQuery } from '@tanstack/react-query'
import { getVendorById, getVendors } from '@/api/auth'
import type { Vendor } from '@/types/auth'

export const useVendors = () => {
    return useQuery<Vendor[]>({
        queryKey: ["vendors"],
        queryFn: getVendors,
    });
};

export const useVendor = (vendorId: number) => {
    return useQuery<Vendor>({
        queryKey: ['vendor', vendorId],
        queryFn: async () => getVendorById(vendorId),
        enabled: !!vendorId
    })
}
