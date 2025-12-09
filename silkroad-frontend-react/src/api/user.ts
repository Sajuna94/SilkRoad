import { api } from "@/api/instance"
import type { RegisterPayload, Vendor } from "@/types/user";

export const loginUser = async (email: string, password: string) => {
	const res = await api.post("/user/login", { email, password });
	return res.data;
};

export const registerUser = async (payload: RegisterPayload) => {
	const res = await api.post("/user/register", payload);
	return res.data;
};

export const getVendors = async (): Promise<Vendor[]> => {
	return (await api.get("/vendors")).data;
};

export const getVendorById = async (id: number): Promise<Vendor> => {
	return (await api.get(`/vendors/${id}`)).data;
};