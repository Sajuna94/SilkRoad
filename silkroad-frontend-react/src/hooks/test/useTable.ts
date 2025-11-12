// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// export function useTableData<T>(endpoint: string) {
//     const queryClient = useQueryClient()

//     const { data = [], isLoading } = useQuery<T[]>({
//         queryKey: [endpoint],
//         queryFn: async () => {
//             const res = await fetch(endpoint)
//             return res.json()
//         },
//     })

//     const create = useMutation({
//         mutationFn: async (newItem: Partial<T>) => {
//             const res = await fetch(endpoint, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(newItem),
//             })
//             return res.json()
//         },
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: [endpoint] }),
//     })

//     const update = useMutation({
//         mutationFn: async ({ id, ...rest }: Partial<T> & { id: number }) => {
//             const res = await fetch(`${endpoint}/${id}`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify(rest),
//             })
//             return res.json()
//         },
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: [endpoint] }),
//     })

//     const remove = useMutation({
//         mutationFn: async (id: number) => {
//             const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' })
//             return res.json()
//         },
//         onSuccess: () => queryClient.invalidateQueries({ queryKey: [endpoint] }),
//     })

//     return { data, isLoading, create, update, remove }
// }
