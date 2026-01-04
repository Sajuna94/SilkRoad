import axios, { AxiosError } from "axios";


const apiBaseURL =
	window.location.hostname === "localhost"
		? "http://localhost:5000"      // 本地開發
		: "https://silkroad-lhyz.onrender.com";    // 部署後端

export const api = axios.create({
	baseURL: `${apiBaseURL}/api`,
	withCredentials: true,
	timeout: 10000,
});

export type ApiErrorBody = AxiosError<{
	success: false;
	message: string;
	requires_verification?: boolean;
	email?: string;
}>;

api.interceptors.response.use(
	res => res,
	err => {
		const status = err.response?.status
		const message = err.response?.data?.error ?? err.message

		switch (status) {
			case 400:
				console.warn('Bad Request:', message)
				break
			case 401:
				console.warn('Unauthorized:', message)
				// 可選：導向登入頁
				// window.location.href = '/login'
				break
			case 403:
				console.warn('Forbidden:', message)
				break
			case 404:
				console.warn('Not Found:', message)
				break
			case 500:
				console.error('Server Error:', message)
				break
			case 501:
				console.warn('Not Implemented:', message)
				break
			default:
				break
		}

		// 將錯誤拋出給呼叫端（例如 React Query）
		return Promise.reject(err)
	}
)

// 1. 取得購物車：對應 GET /cart/view/<id>
export const getCartData = (cartId: number) => 
    api.get(`/cart/view/${cartId}`);

// 2. 移除商品：對應 POST /cart/remove
export const removeFromCart = (cartItemId: number) => 
    api.post('/cart/remove', { cart_item_id: cartItemId });

// 3. 加入購物車：對應 POST /cart/add
export const addToCart = (data: {
    customer_id?: number;
    vendor_id: number;
    product_id: number;
    quantity: number;
    selected_sugar: string;
    selected_ice: string;
    selected_size: string;
}) => api.post('/cart/add', data);

/** --- 訂單 API (order_routes) --- **/

// 4. 取得可用折價券：確保 Sidebar 抓取真資料而非假資料
export const getAvailablePolicies = (vendorId: number) => 
    api.post('/vendor/view_discount', { vendor_id: vendorId });

// 5. 付款結帳：對應 POST /order/trans (觸發 trans_to_order)
// 包含所有必備欄位：customer_id, vendor_id, policy_id, note, payment_methods
export const createOrder = (data: {
    customer_id: number;
    vendor_id: number;
    policy_id: number | null; // 必須提供，若無折價券則傳 null
    note: string;
    payment_methods: string;
}) => api.post('/order/trans', data);