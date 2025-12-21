import { api } from '@/api/instance';
import { useMutation } from '@tanstack/react-query'
import axios from 'axios';

type CloudinarySign = {
	api_key: string;
	timestamp: number;
	signature: string;
	folder: string;
	cloud_name: string;
};

export const useCloudinaryUpload = () => {
	return useMutation({
		mutationFn: async (file: File): Promise<{ secure_url: string }> => {
			const res = await api.get('/test/cloudinary-signature');
			const sign = res.data as CloudinarySign;

			const formData = new FormData();
			formData.append('file', file);
			formData.append('api_key', sign.api_key);
			formData.append('timestamp', sign.timestamp.toString());
			formData.append('signature', sign.signature);
			formData.append('folder', sign.folder);

			const url = `https://api.cloudinary.com/v1_1/${sign.cloud_name}/image/upload`;
			return (await axios.post(url, formData)).data;
		}
	});
}