import { api } from '@/api/instance';
import { getCloudinarySignature } from '@/api/util';
import { useMutation } from '@tanstack/react-query'

export const useCloudinaryUpload = () => {
    return useMutation({
        mutationFn: async (file: File): Promise<{ secure_url: string }> => {
            const signData = await getCloudinarySignature();
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', signData.api_key);
            formData.append('timestamp', signData.timestamp.toString());
            formData.append('signature', signData.signature);
            formData.append('folder', signData.folder);

            const url = `https://api.cloudinary.com/v1_1/${signData.cloud_name}/image/upload`;
            return (await api.post(url, formData)).data;
        }
    });
}