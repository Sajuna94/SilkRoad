import { api } from "@/api/instance"
import type { Vendor } from "@/types/user";

export const getVendors = async (): Promise<Vendor[]> => {
    return (await api.get("/vendors")).data;
};

export const getVendorById = async (id: number): Promise<Vendor> => {
    return (await api.get(`/vendors/${id}`)).data;
};