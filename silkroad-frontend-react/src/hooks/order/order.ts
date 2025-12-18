import { api, type ApiErrorBody } from "@/api/instance";
import type { Order } from "@/types/order";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";


export const useOrders = (customerId?: number) => {
	return useQuery<Order[], AxiosError<ApiErrorBody>>({
		queryKey: ["orders", customerId],
		queryFn: async () => {
			const res = await api.get("/order", {
				params: { customer_id: customerId },
			});
			return res.data.data;
		},
	});

}