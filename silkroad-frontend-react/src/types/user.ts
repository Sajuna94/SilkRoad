type Role = "admin" | "vendor" | "customer" | "guest";

interface BaseUser {
    id: number
    name: string
    email: string
    phone_number: string
	role: Role
    created_at: string
}

export interface Admin extends BaseUser {
    role: 'admin'
}

export interface Vendor extends BaseUser {
    role: 'vendor'
    is_active: boolean
    revenue: number
    address: string
    manager_id?: number
}

export interface Customer extends BaseUser {
    role: 'customer'
    is_active: boolean
    membership_level: number
    stored_balance: number
    address: string
}

export type User = Admin | Vendor | Customer