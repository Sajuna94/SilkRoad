# Vite React TypeScript

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
silkroad-frontend-react/
├─ node_modules/          ← npm 套件安裝目錄 (前端套件)
├─ public/                ← 公開靜態資源 (favicon, images)
│   └─ 404.html           ← 
├─ src/                   ← 前端主要程式碼
│   ├─ assets/            ← 圖片、字型等靜態資源
│   ├─ components/        ← React 可重用元件
│   │   ├─ atoms/                 ← 最小、不可拆的 UI 元件
│   │   ├─ molecules/             ← 原子元件組合成的小元件
│   │   └─ organisms/             ← 複雜組件（多個 molecule/atom 組合）
│   ├─ hooks/             ← 自訂 React Hook
│   ├─ layout/            ← 共用版面配置 (Layout 元件)
│   ├─ pages/             ← 各頁面元件
│   │   ├─ Auth/                  ← 認證相關頁面或組件
│   │   ├─ Vendor/                ← 店家後台頁面
│   │   ├─ Admin/                 ← 管理員後台頁面
│   │   └─ HomePage.tsx           ← 首頁 / 商品總覽
│   ├─ router/            ← 前端路由設定 (React Router)
│   │   ├─ index.tsx              ←
│   │   └─ private.tsx            ←
│   ├─ types/             ← Database 型別定義
│   ├─ store/             ← (未實作)全域狀態管理 (Redux / Zustand / Context API)
│   │   └─ index.ts
│   ├─ utils/             ← (未實作)工具函式、API 封裝
│   │   └─ api.ts
│   ├─ App.tsx            ← React 根組件
│   ├─ index.css          ← 全域 css
│   └─ main.tsx           ← 專案入口，掛載 React 到 DOM
├─ .gitignore             ← Git 忽略設定
├─ index.html             ← 專案 HTML 模板
├─ package.json           ← npm 套件與 script
├─ vite.config.ts         ← Vite 打包/開發設定
└─ README.md              ← 專案說明文件
```
