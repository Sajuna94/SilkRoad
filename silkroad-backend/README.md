# Backend

## istall Dependencies
### with uv
```bash
uv sync
```

### with pip
```bash
#for unix-like
cd silkroad-backend
chmod +x sync.sh
./sync.sh

#for windows NOTE: only for powershell not cmd
cd silkroad-backend
.\sync.ps1
```

## if you dont want a single line xd
```bash
# 1. 用 py 重新建立虛擬環境 (它會使用 3.13)
py -m venv .venv

# 2. 啟動
.\.venv\Scripts\Activate.ps1

# 3. 安裝套件
pip install -e .

## Run backend server
### uv 
```bash
cd silkroad-backend
uv run src/app.py
```

### python
```bash 
cd silkroad-backend
python3 src/app.py
```
### You can not run with this version because I just complete modles part :-)

### If you want to test api, you can use postman.

## structure
```bash
.
├── pyproject.toml              <-- python 配置文件(管理依賴，沒事別動)
├── README.md
├── src
│   ├── app.py                  <-- server main program
│   ├── config                  <-- 配置
│   │   ├── __init__.py
│   │   └── database.py         <-- 初始化資料庫
│   ├── controllers             <-- 處理 API
│   │   ├── __init__.py
│   │   ├── cart_controller.py
│   │   ├── shop_controller.py
│   │   └── user_controller.py
│   ├── middlewares             <-- 我也不知道這要幹嘛，就先留著
│   │   └── __init__.py
│   ├── models                  <-- 定義 ORM 類別
│   │   ├── __init__.py
│   │   ├── cart.py
│   │   ├── shops.py
│   │   └── users.py
│   ├── routes                  <-- 定義API
│   │   ├── __init__.py
│   │   ├── cart_routes.py
│   │   ├── shop_routes.py
│   │   └── user_routes.py
│   ├── test                    <-- 測試
│   │   ├── __init__.py
│   │   └── API_test.py
│   └── utils                   <-- 工具
│       └── __init__.py
├── .env                        <-- 環境變數(DB_URL)
├── .python-version             <--python版本
└── uv.lock                     <-- 別動

```
### NOTE:
> **若對任何目錄有疑惑可以去看那個目錄下的__init__.py**

## 此行純測試用 我會刪掉