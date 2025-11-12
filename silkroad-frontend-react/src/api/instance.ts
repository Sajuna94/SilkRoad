import axios from "axios";

export const api = axios.create({
    baseURL: "/api",
    timeout: 10000,
});

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