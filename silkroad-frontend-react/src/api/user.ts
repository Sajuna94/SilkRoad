import { api } from "@/api/instance";
// import type { User, Vendor } from "@/types/user";
import type { Vendor } from "@/types/user";

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/user/login", { email, password });
  return res.data;
};

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const res = await api.post("/user/register", { name, email, password });
  return res.data;
};

export const getVendors = async (): Promise<Vendor[]> => {
  return (await api.get("/vendors")).data;
};

export const getVendorById = async (id: number): Promise<Vendor> => {
  return (await api.get(`/vendors/${id}`)).data;
};
