# SilkRoad

## Install Dependencies

```c++
cd silkroad-frontend-react
npm install        # 安裝前端依賴
npm run dev        # 啟動開發伺服器

cd silkroad-backend
npm install        # 安裝後端依賴
npm run dev        # 啟動後端 API 伺服器
```

## Run Website

```shell
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
```markdown
silkroad-frontend-react/
├─ node_modules/          ← npm 套件安裝目錄 (前端套件)
├─ public/                ← 公開靜態資源 (favicon, images)
├─ src/                   ← 前端主要程式碼
│   ├─ assets/            ← 圖片、字型等靜態資源
│   ├─ components/        ← React 可重用元件
│   ├─ pages/             ← 各頁面元件
│   ├─ router/            ← 前端路由設定 (React Router)
│   ├─ store/             ← (尚未實作) 狀態管理 (Redux / Zustand / Context API)
│   │   └─ index.ts
│   ├─ utils/             ← (尚未實作) 工具函式、API 呼叫
│   │   └─ api.ts
│   ├─ App.tsx            ← React 根組件
│   └─ main.tsx           ← 專案入口，掛載 React 到 DOM
│   └─ index.css          ← 全域 css
├─ .gitignore             ← Git 忽略設定
├─ index.html             ← 專案 HTML 模板
├─ package.json           ← npm 套件與 script
├─ vite.config.ts         ← Vite 打包/開發設定
└─ README.md
```

#
> **共用資源結構**
```bash
silkroad-shared/
├─ src/
│  ├─ utils/          ← 工具函式，例如驗證、日期格式化
│  ├─ constants/      ← 常數，例如狀態碼、選單列表
│  └─ components/     ← 可選：共用 React 元件
├─ package.json
└─ README.md
```
