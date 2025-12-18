export enum UserRole {
	ADMIN = 'admin',
	VENDOR = 'vendor',
	CUSTOMER = 'customer',
}

interface BaseUser {
	id: number
	name: string
	email: string
	phone_number: string
	role: UserRole
	created_at?: string
}

export interface Admin extends BaseUser {
	role: UserRole.ADMIN
}

export interface Vendor extends BaseUser {
	role: UserRole.VENDOR
	is_active: boolean
	revenue: number
	address: string
	manager_id?: number
}

export interface Customer extends BaseUser {
	role: UserRole.CUSTOMER
	is_active: boolean
	membership_level: number
	stored_balance: number
	address: string
}

export type User = Admin | Vendor | Customer;

