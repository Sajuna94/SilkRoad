import { getPing } from "@/api/instance";
import { useQuery } from "@tanstack/react-query";

export function usePing() {
    return useQuery({
        queryKey: ["ping"],
        queryFn: getPing,
        // TODO: when backend prod should remove
        retry: false,
        refetchOnWindowFocus: false,
    });
}