import { api, type ApiErrorBody } from "@/api/instance";
import { useMutation, useQuery } from "@tanstack/react-query";

export type BlockUserReq = {
  admin_id: number;
  target_user_id: number;
  reason: string;
};

export type UnblockUserReq = {
  admin_id: number;
  target_user_id: number;
};

export type PostAnnouncementReq = {
  admin_id: number;
  message: string;
};

export type UpdateAnnouncementReq = {
  admin_id: number;
  message: string;
};

export type DeleteAnnouncementReq = {
  admin_id: number;
};

export type UpdateAnnouncementArgs = {
  announcement_id: number;
  admin_id: number;
  message: string;
};

export type DeleteAnnouncementArgs = {
  announcement_id: number;
  admin_id: number;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  membership_level: number;
  is_active: boolean;
  created_at: string;
};

export type Vendor = {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  address: string;
  vendor_manager_id: number;
  is_active: boolean;
  created_at: string;
};

export type Announcement = {
  id: number;
  admin_id: number;
  message: string;
  created_at: string;
};

export const useBlockUser = () => {
  return useMutation<any, ApiErrorBody, BlockUserReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/admin/block", payload);
      return res.data;
    },
  });
};

export const useUnblockUser = () => {
  return useMutation<any, ApiErrorBody, UnblockUserReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/admin/unblock", payload);
      return res.data;
    },
  });
};

export const usePostAnnouncement = () => {
  return useMutation<any, ApiErrorBody, PostAnnouncementReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/admin/announce", payload);
      return res.data;
    },
  });
};

export const useUpdateAnnouncement = () => {
  return useMutation<any, ApiErrorBody, UpdateAnnouncementArgs>({
    mutationFn: async ({ announcement_id, admin_id, message }) => {
      const res = await api.put(`/admin/announce/${announcement_id}`, {
        admin_id,
        message,
      });
      return res.data;
    },
  });
};

export const useDeleteAnnouncement = () => {
  return useMutation<any, ApiErrorBody, DeleteAnnouncementArgs>({
    mutationFn: async ({ announcement_id, admin_id }) => {
      // 注意 axios delete 的 body 需要包在 data 屬性裡
      const res = await api.delete(`/admin/announce/${announcement_id}`, {
        data: { admin_id },
      });
      return res.data;
    },
  });
};

//queries

export const useAllCustomers = () => {
  return useQuery<Customer[], ApiErrorBody>({
    queryKey: ["admin", "customers"],
    queryFn: async () => {
      const res = await api.get("/admin/customers");
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useAllVendors = () => {
  return useQuery<Vendor[], ApiErrorBody>({
    queryKey: ["admin", "vendors"],
    queryFn: async () => {
      const res = await api.get("/admin/vendors");
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });
};

export const useAllAnnouncements = () => {
  return useQuery<Announcement[], ApiErrorBody>({
    queryKey: ["admin", "announcements"],
    queryFn: async () => {
      const res = await api.get("/admin/announcements");
      return res.data.data;
    },
    refetchOnWindowFocus: false,
  });
};
