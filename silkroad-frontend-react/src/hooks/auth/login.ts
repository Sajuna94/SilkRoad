import { loginUser, registerUser } from "@/api/user";
import type { RegisterPayload, User } from "@/types/user";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const useLogin = () => {
	return useMutation<User, AxiosError, { email: string; password: string }>({
		mutationFn: async ({ email, password }) => loginUser(email, password)
	});
};

export const useRegister = () => {
	return useMutation<any, AxiosError, RegisterPayload>({
		mutationFn: registerUser,
	});
};