import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, type ApiErrorBody } from "@/api/instance";
import type {
  AddDiscountPolicyInput,
  ViewDiscountPoliciesInput,
  ViewDiscountPoliciesResponse,
  InvalidDiscountPolicyInput,
} from "@/types/order";

// Add discount policy response
export type AddDiscountPolicyResponse = {
  policy_id: number;
  message: string;
  success: boolean;
};

// Invalid discount policy response
export type InvalidDiscountPolicyResponse = {
  message: string;
  success: boolean;
};

/**
 * Hook to fetch discount policies for a vendor
 * @param vendorId - The vendor's ID
 */
export const useViewDiscountPolicies = (vendorId: number) => {
  return useQuery<ViewDiscountPoliciesResponse, ApiErrorBody>({
    queryKey: ["discountPolicies", vendorId],
    queryFn: async () => {
      const payload: ViewDiscountPoliciesInput = { vendor_id: vendorId };
      const res = await api.post("/vendor/view_discount", payload);
      return res.data;
    },
    enabled: !!vendorId, // Only run query if vendorId is provided
  });
};

/**
 * Hook to add a new discount policy
 * Invalidates the discount policies query on success
 */
export const useAddDiscountPolicy = () => {
  const qc = useQueryClient();

  return useMutation<AddDiscountPolicyResponse, ApiErrorBody, AddDiscountPolicyInput>({
    mutationFn: async (payload) => {
      const res = await api.post("/vendor/add_discount", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the discount policies query to refetch updated data
      qc.invalidateQueries({ queryKey: ["discountPolicies", variables.vendor_id] });
    },
  });
};

/**
 * Hook to invalidate (disable) a discount policy
 * Invalidates the discount policies query on success
 */
export const useInvalidDiscountPolicy = () => {
  const qc = useQueryClient();

  return useMutation<InvalidDiscountPolicyResponse, ApiErrorBody, InvalidDiscountPolicyInput>({
    mutationFn: async (payload) => {
      const res = await api.post("/vendor/invalid_discount", payload);
      return res.data;
    },
    onSuccess: (_, variables) => {
      // Invalidate the discount policies query to refetch updated data
      qc.invalidateQueries({ queryKey: ["discountPolicies", variables.vendor_id] });
    },
  });
};
