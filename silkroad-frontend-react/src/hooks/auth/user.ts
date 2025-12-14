import { api, type ApiErrorBody } from "@/api/instance";
import type { User } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";


export type LoginReq = { email: string; password: string };
export type RegisterReq = { email: string; password: string; phone_number: string, role: string; };

export const useLogin = () => {
	const qc = useQueryClient();

	return useMutation<User, AxiosError<ApiErrorBody>, LoginReq>({
		mutationFn: async (payload) => {
			const res = await api.post("/user/login", payload);
			return res.data.data[0];
		},
		onSuccess: (res) => {
			console.log("Login successful, setting user in query cache:", res);
			qc.setQueryData(["user"], res);
		},
	});
};

export const useRegister = (role: string) => {
	const qc = useQueryClient();

	return useMutation<User, AxiosError<ApiErrorBody>, RegisterReq>({
		mutationFn: async (payload) => {
			const res = await api.post(`/user/register/${role}`, payload);
			return res.data.data[0];
		},
		onSuccess: (res) => {
			if (role !== "guest")
				qc.setQueryData(["user"], res);
		},
	});
};

export const useUser = () => {
	return useQuery<User, AxiosError<ApiErrorBody>>({
		queryKey: ["user"],
		queryFn: async () => {
			const res = await api.get("/user/me");
			return res.data.data;
		},
		retry: false,
		refetchOnWindowFocus: false,
	});
}

export const useLogout = () => {
	const qc = useQueryClient();

	return useMutation<void, AxiosError>({
		mutationFn: async () => {
			await api.post("/user/logout");
		},
		onSuccess: () => {
			// Clear user data from React Query cache upon logout
			qc.removeQueries({ queryKey: ["user"] });
		},
	});
}

