import { api } from "@/api/instance"

export type LoginReq = { email: string; password: string };
export type RegisterReq = { email: string; password: string; phone_number: string, role: string; };

export type AuthSuccessRes = {
	success: boolean;
	message: string;
	data: any;
};

export const login = async (payload: LoginReq): Promise<AuthSuccessRes> => {
	const res = await api.post("/user/login", payload);
	return res.data;
};

export const logout = async () => {
	const res = await api.post("/user/logout");
	return res.data;
};

export const register = async (payload: RegisterReq): Promise<AuthSuccessRes> => {
	const res = await api.post("/user/register", payload);
	return res.data;
};