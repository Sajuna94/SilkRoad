import { api } from "./instance";

export const getCloudinarySignature = async (): Promise<{
    api_key: string;
    timestamp: number;
    signature: string;
    folder: string;
    cloud_name: string;
}> => {
    return (await api.get('/cloudinary-signature')).data;
}