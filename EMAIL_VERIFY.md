# Email 驗證功能實作進度報告

目前已在 `EmailVerify` 分支上完成了 Email 驗證系統的核心開發，涵蓋後端邏輯、郵件發送、排程清理以及前端 UI 流程。

## 🛠 已完成功能

### 1. 後端 (Flask)
- **資料庫擴充**：`User` 模型新增 `is_verified` (預設 False), `verification_code`, `verification_code_expires_at`。
- **郵件服務整合**：引入 `Flask-Mail` 並完成 SMTP 配置架構（支援 Gmail 應用程式密碼）。
- **註冊流程優化**：
    - 註冊完成後不再直接登入，改為生成 6 位數驗證碼並發送郵件。
    - 登入 API 增加攔截：未驗證用戶會被導向驗證流程。
- **驗證 API (`/verify-email`)**：
    - 支援驗證碼比對與時效檢查。
    - **自動登入**：驗證成功後直接設定 Session，並處理購物車合併。
- **排程清理任務**：
    - 引入 `flask-apscheduler`。
    - 每 30 分鐘自動刪除「未驗證且驗證碼已過期」的帳號，防止無效佔用 Email。

### 2. 前端 (React)
- **全新驗證頁面 (`/verify-email`)**：
    - **中文化介面**：所有提示與文字已轉換為繁體中文。
    - **OTP 輸入框**：採用 6 個獨立輸入格的現代化設計，支援數字自動跳格、倒退刪除與黏貼。
    - **倒數計時**：實作「重新發送驗證碼」按鈕的 60 秒冷卻機制。
    - **流程串接**：註冊成功或未驗證登入時，自動帶入 Email 導向驗證頁；驗證成功後自動跳轉至首頁。
- **Hook 封裝**：新增 `useVerifyEmail` 與 `useResendCode` 管理狀態。

---

## 📂 修改檔案清單

### 後端
- `silkroad-backend/pyproject.toml` (新增依賴)
- `silkroad-backend/src/app.py` (初始化 Mail 與 Scheduler)
- `silkroad-backend/src/models/auth/user.py` (新增欄位)
- `silkroad-backend/src/controllers/user_controller.py` (核心驗證與自動登入邏輯)
- `silkroad-backend/src/config/mail.py` (新檔案：郵件配置)
- `silkroad-backend/src/utils/tasks.py` (新檔案：定期清理任務)
- `silkroad-backend/src/routes/user_routes.py` (註冊新路由)

### 前端
- `silkroad-frontend-react/src/router/index.tsx` (新增路由)
- `silkroad-frontend-react/src/hooks/auth/user.ts` (新增 API Hooks)
- `silkroad-frontend-react/src/pages/Main/Auth/forms/VerifyEmail.tsx` (新頁面：OTP 驗證表單)
- `silkroad-frontend-react/src/pages/Main/Auth/forms/Register.tsx` (移除密碼強度邏輯)
- `silkroad-frontend-react/src/pages/Main/Auth/forms/Login.tsx` (處理未驗證登入報錯)
- `silkroad-frontend-react/src/api/instance.ts` (更新錯誤型別)

---

## 🚀 待執行事項 (給開發者)

1.  **資料庫更新**：需手動執行 SQL 增加欄位。
2.  **環境變數**：在 `.env` 設定 `MAIL_PASSWORD` (應用程式密碼)。
3.  **依賴安裝**：執行 `uv sync` 或 `pip install flask-mail flask-apscheduler`。
