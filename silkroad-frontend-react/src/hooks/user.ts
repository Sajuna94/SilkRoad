import { useQuery } from '@tanstack/react-query'
import { getVendorById } from '@/api/user'
import type { Vendor } from '@/types/auth'

export const useVendor = (user_id: number) => {
    return useQuery<Vendor>({
        queryKey: ['vendor', user_id],
        queryFn: () => getVendorById(user_id),
        enabled: !!user_id
    })
}
