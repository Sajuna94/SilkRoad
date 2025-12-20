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
  announcement_id: number;
  message: string;
  created_at: string;
};

export type UpdateVendorStatusReq = {
  admin_id: number;
  status: "active" | "suspended";
};

export const useUpdateVendorStatus = (vendorId: number) => {
  return useMutation<any, ApiErrorBody, UpdateVendorStatusReq>({
    mutationFn: async (payload) => {
      const res = await api.post(
        `/admin/vendors/${vendorId}/status`,
        payload
      );
      return res.data;
    },
  });
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

export const useUpdateAnnouncement = (announcementId: number) => {
  return useMutation<any, ApiErrorBody, UpdateAnnouncementReq>({
    mutationFn: async (payload) => {
      const res = await api.put(
        `/admin/announce/${announcementId}`,
        payload
      );
      return res.data;
    },
  });
};

export const useDeleteAnnouncement = (announcementId: number) => {
  return useMutation<any, ApiErrorBody, DeleteAnnouncementReq>({
    mutationFn: async (payload) => {
      const res = await api.delete(
        `/admin/announce/${announcementId}`,
        { data: payload }
      );
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

