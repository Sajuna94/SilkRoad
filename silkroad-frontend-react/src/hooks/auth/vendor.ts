import { useQuery } from '@tanstack/react-query'
import { getVendorById, getVendors } from '@/api/auth'
import type { Vendor } from '@/types/auth'

export const useVendors = () => {
    return useQuery<Vendor[]>({
        queryKey: ["vendors"],
        queryFn: getVendors,
    });
};

export const useVendor = (user_id: number) => {
    return useQuery<Vendor>({
        queryKey: ['vendor', user_id],
        queryFn: () => getVendorById(user_id),
        enabled: !!user_id
    })
}
