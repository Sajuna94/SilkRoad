import { addOrder } from "@/api/order";
import type { InsertOrderInput, Order } from "@/types/order";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useOrder = () => {
    return useQuery({
        queryKey: ["order"],
        queryFn: async () => {
            return { "messsage": "fjoifefjoief" };
        },
    });
}

export const useInsertOrder = () => {
    const queryClient = useQueryClient();

    return useMutation<Order, AxiosError, InsertOrderInput>({
        mutationFn: addOrder,
        onSuccess: () => {
        },
    });
};
