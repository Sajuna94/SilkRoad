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
      // 重置查詢標記，允許重新查詢
      resetQueryFlag();
      // 直接設置用戶數據
      qc.setQueryData(["user"], res);
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
      // 重置查詢標記，允許重新查詢
      resetQueryFlag();
      // 直接設置用戶數據
      qc.setQueryData(["user"], res);
    },
    onError: (error) => {
      console.error("註冊失敗:", error.response?.data);
    },
  });
};

export const useLogout = () => {
  const qc = useQueryClient();

  return useMutation<void, ApiErrorBody>({
    mutationFn: async () => {
      await api.post("/user/logout");
    },
    onSuccess: () => {
      // 重置查詢標記，允許重新查詢
      resetQueryFlag();
      // 清除用戶數據
      // qc.setQueryData(["user"], undefined);
      qc.clear();
    },
  });
};

// 用於追蹤查詢狀態的全局變量
let hasEverQueried = false;

// 重置查詢標記（登入/登出時使用）
const resetQueryFlag = () => {
	hasEverQueried = false;
};

export const useCurrentUser = () => {
	return useQuery<User, ApiErrorBody>({
		queryKey: ["user"],
		queryFn: async () => {
			// 在查詢開始時就標記，避免失敗時重複查詢
			hasEverQueried = true;
			try {
				const res = await api.get("/user/current_user");
				console.log(res);
				return res.data.data;
			} catch (error) {
				// 即使失敗也不要再次查詢
				throw error;
			}
		},
		// 關鍵：只在從未查詢過時才啟用
		enabled: !hasEverQueried,
		retry: false,
		refetchOnWindowFocus: false,
		refetchOnMount: false,
		refetchOnReconnect: false,
		staleTime: Infinity,
		gcTime: Infinity,
	});
}

type TopUpReq = { amount: number };
type TopUpRes = { new_balance: number; added_amount: number };

export const useTopUp = () => {
  const qc = useQueryClient();

  return useMutation<TopUpRes, ApiErrorBody, TopUpReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/user/topup", payload);
      return res.data.data;
    },
    onSuccess: (data) => {
      // 更新 user query cache 中的 stored_balance
      qc.setQueryData<User>(["user"], (old) => {
        if (!old || old.role !== "customer") return old;
        return { ...old, stored_balance: data.new_balance };
      });
    },
  });
};

type UpdateUserReq = {
  name?: string;
  phone_number?: string;
  address?: string;
};

export const useUpdateUser = () => {
  const qc = useQueryClient();

  return useMutation<User, ApiErrorBody, UpdateUserReq>({
    mutationFn: async (payload) => {
      const res = await api.patch("/user/me", payload);
      return res.data.data[0];
    },
    onSuccess: (userData) => {
      // 直接更新用戶數據，不需要重新查詢
      qc.setQueryData(["user"], userData);
    },
  });
};

// 獲取所有可用的店家 ID
export const useVendorIds = () => {
  return useQuery<number[], ApiErrorBody>({
    queryKey: ["vendorIds"],
    queryFn: async () => {
      const res = await api.get("/user/vendors/ids");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
};
