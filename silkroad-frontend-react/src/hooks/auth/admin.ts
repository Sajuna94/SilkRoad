import { api, type ApiErrorBody } from "@/api/instance";
import { useMutation, useQuery } from "@tanstack/react-query";

import type { Customer, Vendor } from "@/types/user";

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

export type UpdateAnnouncementArgs = {
  announcement_id: number;
  admin_id: number;
  message: string;
};

export type DeleteAnnouncementArgs = {
  announcement_id: number;
  admin_id: number;
};

// Announcement 暫時保留在這裡，或是移到 src/types/data.ts 統一管理也可以
export type Announcement = {
  id: number;
  admin_id: number;
  message: string;
  created_at: string;
};

// --- Hooks ---

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
      const res = await api.delete(`/admin/announce/${announcement_id}`, {
        data: { admin_id },
      });
      return res.data;
    },
  });
};

// --- Queries ---

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
