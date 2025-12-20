import { api, type ApiErrorBody } from "@/api/instance";
import type { User, UserRole } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type LoginReq = { email: string; password: string };

type RegisterReq = {
  email: string;
  password: string;
  phone_number: string;
  role: string;
};
type RegisterVendorReq = {
  manager: { name: string; email: string; phone_number: string };
  vendor: { name: string; address: string };
};
type RegisterCustomerReq = {
  name: string;
  address: string;
};
type RegisterRoleReq = RegisterVendorReq | RegisterCustomerReq;

export const useLogin = () => {
  const qc = useQueryClient();

  return useMutation<User, ApiErrorBody, LoginReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/user/login", payload);
      return res.data.data[0];
    },
    onSuccess: (res) => {
      console.log(`[${res.role}] Login successful:`, res);
      qc.setQueryData(["user"], res);
      qc.invalidateQueries({ queryKey: ["user"] });
    },
  });
};

export const useRegister = () => {
  return useMutation<any, ApiErrorBody, RegisterReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/user/register/guest", payload);
      return res.data;
    },
  });
};

export const useRegisterRole = (role: UserRole) => {
  const qc = useQueryClient();

  return useMutation<User, ApiErrorBody, RegisterRoleReq>({
    mutationFn: async (payload) => {
      const res = await api.post(`/user/register/${role}`, payload);
      return res.data.data[0];
    },
    onSuccess: (res) => {
      qc.setQueryData(["user"], res);
      qc.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("註冊失敗:", error.response?.data);
    },
  });
};

export const useUser = () => {
  return useQuery<User, ApiErrorBody>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await api.get("/user/me");
      return res.data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation<void, ApiErrorBody>({
    mutationFn: async () => {
      await api.post("/user/logout");
    },
    onSuccess: () => {
      qc.clear();
      qc.invalidateQueries();
    },
  });
};

export const useCurrentUser = () => {
  return useQuery<User, ApiErrorBody>({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await api.get("/user/current_user");
      console.log(res);
      return res.data.data;
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
};
