# SilkRoad

[Web Link](https://sajuna94.github.io/SilkRoad/)

## Install Dependencies

```bash
cd silkroad-frontend-react
npm install        # 安裝前端依賴
npm run dev        # 啟動開發伺服器

cd silkroad-backend
npm install        # 安裝後端依賴
npm run dev        # 啟動後端 API 伺服器
```

## Run Website

```bash
cd silkroad-frontend-react
npm run dev
```

## Project Structure

> **後端結構(參考)**

```js
silkroad-backend/
├─ src/
│  ├─ controllers/       ← 處理 API 請求
│  ├─ routes/            ← 定義 API 路由
│  ├─ models/            ← 資料庫模型
│  ├─ middlewares/       ← 認證、日誌、CORS 等中介層
│  ├─ utils/             ← 共用工具函式 (hash 密碼、日期格式化等)
│  ├─ config/            ← 資料庫、環境變數設定
│  └─ app.js / server.js  ← 伺服器入口
├─ package.json
└─ .env                  ← 環境變數 (DB 連線、秘鑰)
```

#

> **前端結構**

```js
silkroad-frontend-react/
├─ node_modules/          ← npm 套件安裝目錄 (前端套件)
├─ public/                ← 公開靜態資源 (favicon, images)
├─ src/                   ← 前端主要程式碼
│   ├─ assets/            ← 圖片、字型等靜態資源
│   ├─ components/        ← React 可重用元件
│   │   ├─ Header.tsx               ← 通用導覽列，依角色切換選單
│   │   ├─ Footer.tsx               ← 通用頁尾
│   │   ├─ ProductCard.tsx          ← 商品卡片 (商品列表 & 商店)
│   │   ├─ CartItem.tsx             ← 購物車商品項目
│   │   ├─ ReviewCard.tsx           ← 評價卡片
│   │   ├─ StarRating.tsx           ← 星級評分元件
│   │   ├─ Modal.tsx                ← 全域 Modal 組件
│   │   ├─ Toast.tsx                ← 全域提示訊息
│   │   ├─ Pagination.tsx           ← 分頁組件
│   │   └─ LoadingSkeleton.tsx      ← 載入骨架組件
│   │
│   ├─ pages/             ← 各頁面元件
│   │   ├─ Home.tsx             ← 首頁 / 商品總覽
│   │   ├─ ProductDetail.tsx    ← 商品詳細頁
│   │   ├─ Login.tsx            ← 顧客 / 店家登入頁
│   │   ├─ Register.tsx         ← 顧客 / 店家註冊頁
│   │   ├─ Cart.tsx             ← 顧客購物車
│   │   ├─ OrderHistory.tsx     ← 顧客訂單歷史
│   │   ├─ Review.tsx           ← 顧客撰寫評價
│   │   │
│   │   ├─ Vendor/
│   │   │   ├─ VendorDashboard.tsx  ← 店家首頁儀表板
│   │   │   ├─ VendorProductList.tsx← 商品列表管理
│   │   │   ├─ ProductForm.tsx      ← 新增/編輯商品
│   │   │   ├─ DiscountManagement.tsx ← 折扣設定
│   │   │   └─ SalesDashboard.tsx   ← 銷售統計
│   │   │
│   │   └─ Admin/
│   │       ├─ AdminDashboard.tsx   ← 管理員首頁儀表板
│   │       ├─ UserManagement.tsx   ← 顧客管理
│   │       ├─ VendorManagement.tsx ← 店家管理
│   │       └─ SystemDashboard.tsx  ← 系統監控
│   │
│   ├─ router/            ← 前端路由設定 (React Router)
│   │   ├─ index.tsx                ← React Router 路由設定
│   │   ├─ PrivateRoute.tsx         ← 登入保護路由
│   │   └─ RoleRoute.tsx            ← 角色權限保護路由
│   │
│   ├─ store/             ← (尚未實作) 狀態管理 (Redux / Zustand / Context API)
│   │   ├─ index.ts                 ← Redux / Zustand / Context 全域狀態
│   │   ├─ authStore.ts             ← 登入狀態管理
│   │   ├─ cartStore.ts             ← 購物車狀態管理
│   │   └─ vendorStore.ts           ← 店家資料管理
│   │
│   ├─ utils/             ← (尚未實作) 工具函式、API 呼叫
│   │   └─ api.ts                   ← API 封裝 (axios/fetch)
│   │
│   ├─ App.tsx            ← React 根組件
│   ├─ main.tsx           ← 專案入口，掛載 React 到 DOM
│   └─ index.css          ← 全域 css
│
├─ .gitignore             ← Git 忽略設定
├─ index.html             ← 專案 HTML 模板
├─ package.json           ← npm 套件與 script
├─ vite.config.ts         ← Vite 打包/開發設定
└─ README.md
```

#

> **共用資源結構**

```js
silkroad-shared/
├─ src/
│  ├─ utils/          ← 工具函式，例如驗證、日期格式化
│  ├─ constants/      ← 常數，例如狀態碼、選單列表
│  └─ components/     ← 可選：共用 React 元件
├─ package.json
└─ README.md
```
