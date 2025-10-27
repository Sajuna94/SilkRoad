## Install Dependencies

```bash
cd silkroad-frontend-react
npm install        # 安裝前端依賴
npm run dev        # 啟動開發伺服器
```

## Run Website

```bash
cd silkroad-frontend-react
npm run dev
```

## Structure

```js
<details>
<summary>silkroad-frontend-react/src/ 目錄結構</summary>
src/
├─ assets/ ← 圖片、字型等靜態資源
├─ components/ ← React 可重用元件
│ <details>
│ <summary>atoms/</summary>
│ ← 最小、不可拆的 UI 元件
│ </details>
│ <details>
│ <summary>molecules/</summary>
│ ← 原子元件組合成的小元件
│ </details>
│ <details>
│ <summary>organisms/</summary>
│ ← 複雜組件（多個 molecule/atom 組合）
│ </details>
│ ├─ ReviewCard.tsx ← 評價卡片
│ ├─ StarRating.tsx ← 星級評分元件
│ ├─ Modal.tsx ← 全域 Modal 組件
│ ├─ Toast.tsx ← 全域提示訊息
│ ├─ Pagination.tsx ← 分頁組件
│ └─ LoadingSkeleton.tsx ← 載入骨架組件
├─ hooks/ ← 自訂 React Hook
├─ layout/ ← 共用 Layout 元件
│ ├─ Footer.tsx
│ └─ Header.tsx
├─ pages/ ← 各頁面元件
│ ├─ HomePage.tsx ← 首頁 / 商品總覽
│ ├─ ProductDetail.tsx ← 商品詳細頁
│ ├─ Cart.tsx ← 顧客購物車
│ ├─ OrderHistory.tsx ← 顧客訂單歷史
│ ├─ Review.tsx ← 顧客撰寫評價
│ <details>
│ <summary>Auth/</summary>
│ ├─ LoginPage.tsx
│ └─ RegisterPage.tsx
│ </details>
│ <details>
│ <summary>Vendor/</summary>
│ ├─ VendorDashboard.tsx
│ ├─ VendorProductList.tsx
│ ├─ ProductForm.tsx
│ ├─ DiscountManagement.tsx
│ └─ SalesDashboard.tsx
│ </details>
│ <details>
│ <summary>Admin/</summary>
│ ├─ AdminDashboard.tsx
│ ├─ UserManagement.tsx
│ ├─ VendorManagement.tsx
│ └─ SystemDashboard.tsx
│ </details>
├─ router/ ← 前端路由設定 (React Router)
│ ├─ index.tsx
│ ├─ private.tsx
│ └─ role.tsx
├─ types/ ← TypeScript 型別定義
│ ├─ auth.tsx
│ ├─ store.tsx
│ └─ order.tsx
├─ store/ ← 全域狀態管理 (Redux/Zustand/Context)
│ ├─ index.ts
│ ├─ authStore.ts
│ ├─ cartStore.ts
│ └─ vendorStore.ts
├─ utils/ ← 工具函式、API 封裝
│ └─ api.ts
├─ App.tsx ← 根組件
├─ main.tsx ← 專案入口
└─ index.css ← 全域樣式
</details>

```
