export enum UserRole {
  ADMIN = "admin",
  VENDOR = "vendor",
  CUSTOMER = "customer",
}

export interface BaseUser {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  role: UserRole;
  created_at: string;
}

export interface Admin extends BaseUser {
  role: UserRole.ADMIN;
}

export interface VendorManager {
  id: number;
  name: string;
  email: string;
  phone_number: string;
}

export interface Vendor extends BaseUser {
  role: UserRole.VENDOR;
  revenue: number;
  address: string;
  vendor_manager_id: number;
  vendor_manager?: VendorManager;
  logo_url?: string;
  description?: string;
  is_active: boolean;
}

export interface Customer extends BaseUser {
  role: UserRole.CUSTOMER;
  membership_level: number;
  stored_balance: number;
  address: string;
  is_active: boolean;
}

export type User = Admin | Vendor | Customer;
