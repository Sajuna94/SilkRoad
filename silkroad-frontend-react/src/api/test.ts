import { api } from "./instance";

export const getPing = async (): Promise<string> => {
    const res = await api.get<{ message: string }>("/ping");
    return res.data.message;
}