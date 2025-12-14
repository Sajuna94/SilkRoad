// import { useQuery } from '@tanstack/react-query'
// import { getVendorById, getVendors } from '@/api/user'
// import type { Vendor } from '@/types/user'

// export const useVendors = () => {
//     return useQuery<Vendor[]>({
//         queryKey: ["vendors"],
//         queryFn: getVendors,
//     });
// };

// export const useVendor = (vendorId: number) => {
//     return useQuery<Vendor>({
//         queryKey: ['vendor', vendorId],
//         queryFn: async () => getVendorById(vendorId),
//         enabled: !!vendorId
//     })
// }
