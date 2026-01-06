import { api, type ApiErrorBody } from "@/api/instance";
import type { Product } from "@/types/store";
import type { Vendor } from "@/types/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type SizeOptionItem = {
  name: string;
  price: number;
};

type UpdateProductPayload = {
  product_id: number;
  is_listed: boolean;
}[];

type AddProductReq = {
  name: string;
  price: number;
  description: string;
  options: {
    size: string;
    ice: string;
    sugar: string;
		step: string;
  };
  image_url: string;
};

type UpdateProductFieldsPayload = {
  product_id: number;
  name?: string;
  price?: number;
  description?: string;
  image_url?: string;
  size?: string | SizeOptionItem[];
  sugar?: string;
  ice?: string;
  price_step?: string;
};

type UpdateVendorDescriptionReq = {
  description: string;
};

export interface UpdateVendorManagerReq {
  name: string;
  email: string;
  phone_number: string;
}

export const useUpdateProductsListed = () => {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateProductPayload) => {
      const res = await api.patch("/vendor/products/listed", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useAddProduct = () => {
  const qc = useQueryClient();

  return useMutation<Product, ApiErrorBody, AddProductReq>({
    mutationFn: async (payload) => {
      const res = await api.post("/vendor/product/add", payload);
      return res.data.data;
    },
    onSuccess: (product) => {
      console.log("新增商品成功:", product);
      qc.invalidateQueries({ queryKey: ["vendor"] });
      qc.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("新增商品失敗:", error.response?.data);
    },
  });
};

export const useVendor = (vendorId: number) => {
  return useQuery<Vendor, ApiErrorBody>({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const res = await api.get(`/vendor/${vendorId}`);
      return res.data.data;
    },
    enabled: !!vendorId,
    retry: false,
  });
};

export interface VendorWithStatsRes extends Vendor {
  avg_rating: number;       // 平均評分
  review_count: number;     // 評論數量
}

export const useVendors = () => {
  return useQuery<VendorWithStatsRes[], ApiErrorBody>({
    queryKey: ["vendors"],
    queryFn: async () => {
      const res = await api.get("/vendor/vendors");
      return res.data.data;
    },
    retry: false,
  });
};

export const useVendorProducts = () => {
  return useQuery<Product[], ApiErrorBody>({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await api.get(`/vendor/products`);
      return res.data.products;
    },
    retry: false,
  });
};

export const useVendorProductsByVendorId = (vendorId: number | undefined) => {
  return useQuery<Product[], ApiErrorBody>({
    queryKey: ["vendor-products", vendorId],
    queryFn: async () => {
      if (!vendorId) throw new Error("Vendor ID is required");
      console.log("entry vendor product lsit");
      const res = await api.get(`/vendor/${vendorId}/view_products`);
      return res.data.products;
    },
    enabled: !!vendorId,
    retry: false,
  });
};

// [修正重點 1] 確保 useProductDetail 正確讀取 price_step
export const useProductDetail = (
  vendorId: number | undefined,
  productId: number | undefined
) => {
  return useQuery<Product, ApiErrorBody>({
    queryKey: ["product-detail", vendorId, productId],
    queryFn: async () => {
      if (!vendorId || !productId)
        throw new Error("Vendor ID and Product ID are required");
      const res = await api.get(
        `/vendor/${vendorId}/view_product_detail/${productId}`
      );

      const productData = res.data.product;
      return {
        id: productId,
        vendor_id: vendorId,
        name: productData.name,
        price: productData.price,
        description: productData.description,
        
        // [新增] 讀取後端回傳的 price_step
        // 假設後端 view_vendor_product_detail 在 product 物件下回傳了 price_step
        // 如果後端沒回傳，預設為 0
        price_step: productData.price_step || 0, 

        options: {
          size: productData.size_option || [],
          sugar: productData.sugar_option || [],
          ice: productData.ice_option || [],
        },
        image_url: productData.image_url,
        is_listed: true,
      };
    },
    enabled: !!vendorId && !!productId,
    retry: false,
  });
};

export const useUpdateVendorDescription = () => {
  return useMutation<any, ApiErrorBody, UpdateVendorDescriptionReq>({
    mutationFn: async (payload) => {
      const res = await api.patch("/vendor/description", payload);
      return res.data;
    },
    onSuccess: () => {
    },
  });
};

export const useUpdateVendorManagerInfo = () => {
  const qc = useQueryClient();

  return useMutation<any, ApiErrorBody, UpdateVendorManagerReq>({
    mutationFn: async (payload) => {
      const res = await api.patch("/vendor/manager", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

export const useUpdateVendorLogo = () => {
  const qc = useQueryClient();

  return useMutation<any, ApiErrorBody, { logo_url: string }>({
    mutationFn: async (payload) => {
      const res = await api.patch("/vendor/logo", payload);
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["currentUser"] });
    },
  });
};

// [修正重點 2] useUpdateProduct 確保 price_step 被加入 payload
export const useUpdateProduct = () => {
  const qc = useQueryClient();

  return useMutation<any, ApiErrorBody, UpdateProductFieldsPayload>({
    mutationFn: async (payload) => {
      // const { product_id, ...fields } = payload;

      // const updates = [];

      // if (fields.name !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "name", value: fields.name },
      //   });
      // }
      // if (fields.price !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "price", value: String(fields.price) },
      //   });
      // }
      
      // // [確認] 這段邏輯是正確的，確保 fields.price_step 有值時會加入
      // if (fields.price_step !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "price_step", value: String(fields.price_step) },
      //   });
      // }
      
      // if (fields.description !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "description", value: fields.description },
      //   });
      // }
      // if (fields.image_url !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "image_url", value: fields.image_url },
      //   });
      // }
    
      // if (fields.size !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "size_options", value: fields.size },
      //   });
      // }
      
      // if (fields.sugar !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "sugar_options", value: fields.sugar },
      //   });
      // }
      // if (fields.ice !== undefined) {
      //   updates.push({
      //     product_id,
      //     behavior: { col_name: "ice_options", value: fields.ice },
      //   });
      // }

      // // [新增] 防呆：如果沒有任何欄位要更新，則不發送請求
      // if (updates.length === 0) return { message: "No changes detected", success: true };

      const res = await api.patch(`/vendor/products/${payload.product_id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      // 成功後讓 products 和 product-detail 失效，強制重抓
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["product-detail"] });
    },
  });
};


export type DiscountPolicy = {
  policy_id: number;
  vendor_id: number;
  is_available: boolean;
  type: string;
  value: number;
  min_purchase: number;
  max_discount: number;
  membership_limit: number;
  expiry_date: string;
  start_date?: string;
};

export type AddDiscountReq = {
  vendor_id: number;
  type: string;
  value: number;
  min_purchase: number;
  max_discount: number;
  membership_limit: number;
  expiry_date: string;
};

export type UpdateDiscountReq = AddDiscountReq & {
  policy_id: number;
  code: string;
  start_date: string;
};

export type DiscountPoliciesRes = {
  data: DiscountPolicy[];
  policy_amount: number;
  message: string;
  success: boolean;
};

/**
 * 獲取商家的所有折價券
 */
export const useVendorDiscounts = (vendorId: number) => {
  return useQuery<DiscountPoliciesRes, ApiErrorBody>({
    queryKey: ["discountPolicies", vendorId],
    queryFn: async () => {
      const res = await api.post("/vendor/view_discount", {
        vendor_id: vendorId,
      });
      return res.data;
    },
    enabled: !!vendorId,
  });
};

/**
 * 新增折價券政策
 */
export const useAddDiscount = () => {
  const qc = useQueryClient();

  return useMutation<
    { policy_id: number; success: boolean },
    ApiErrorBody,
    AddDiscountReq
  >({
    mutationFn: async (payload) => {
      const res = await api.post("/vendor/add_discount", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // 刷新該商家的折價券列表
      qc.invalidateQueries({
        queryKey: ["discountPolicies", variables.vendor_id],
      });
    },
  });
};

/**
 * 更新折價券政策
 */
export const useUpdateDiscount = () => {
  const qc = useQueryClient();

  return useMutation<
    { policy_id: number; success: boolean },
    ApiErrorBody,
    UpdateDiscountReq
  >({
    mutationFn: async (payload) => {
      const res = await api.post("/vendor/update_discount", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["discountPolicies", variables.vendor_id],
      });
    },
  });
};

/**
 * 停用（使無效）折價券政策
 */
export const useInvalidateDiscount = () => {
  const qc = useQueryClient();

  return useMutation<
    { success: boolean },
    ApiErrorBody,
    { policy_id: number; vendor_id: number }
  >({
    mutationFn: async (payload) => {
      const res = await api.post("/vendor/invalid_discount", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({
        queryKey: ["discountPolicies", variables.vendor_id],
      });
    },
  });
};