import { addOrder, getOrders } from "@/api/order";
import type { InsertOrderInput, Order } from "@/types/order";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useOrders = (customerId: number) => {
  return useQuery<Order[], AxiosError>({
    queryKey: ["orders", customerId],
    queryFn: () => getOrders(customerId),
    enabled: !!customerId,
  });
};

export const useInsertOrder = () => {
  return useMutation<Order, AxiosError, InsertOrderInput>({
    mutationFn: addOrder,
  });
};
