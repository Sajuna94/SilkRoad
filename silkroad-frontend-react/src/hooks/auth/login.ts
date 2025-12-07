import { loginUser, registerUser } from "@/api/user";
import type { User } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useLogin = () => {
	return useMutation<User, AxiosError, { email: string; password: string }>({
		mutationFn: async ({ email, password }) => loginUser(email, password)
	});
};

export const useRegister = () => {
	return useMutation<User, AxiosError, { name: string, email: string; password: string }>({
		mutationFn: async ({ name, email, password }) => registerUser(name, email, password)
	});
};

