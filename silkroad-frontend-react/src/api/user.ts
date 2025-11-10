import axios from 'axios'
import type { Vendor } from '@/types/auth'


export const getVendorById = async (user_id: number): Promise<Vendor> => {
    return (await axios.get(`/api/vendor/${user_id}`)).data;
}