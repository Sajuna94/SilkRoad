# SilkRoad Backend Testing Guide

這個資料夾包含了 SilkRoad 後端的自動化測試套件，讓你不用再手動用 Postman 測試每個 API！

## 快速開始

### 安裝測試依賴
```bash
# 已經在 pyproject.toml 中包含 pytest
uv sync
```

### 執行測試
```bash
# 執行所有測試
pytest

# 顯示詳細輸出
pytest -v

# 執行特定測試檔案
pytest tests/api/test_user_api.py

# 執行特定測試類別
pytest tests/api/test_user_api.py::TestUserLogin

# 執行單一測試
pytest tests/api/test_user_api.py::TestUserLogin::test_login_success
```

## 重要提醒
1. 在任何開始測試前請記得清理資料庫的資料，否則可能觸發一堆亂七八糟的DB constraint violations  
相信我你不會想處理那堆錯誤的
2. 開始測試前確保你的終端正在使用你的python虛擬環境否則你要在所有`pytest`前加上`python `
3. 這個腳本會把SilkRoad相關的資料全部清除，如果你不希望這麼做，自己想辦法
```bash
python cleanup_test_data.py --direct

#or 

./cleanup.sh

#or 

./cleanup.bat # may failure idk
```

## 測試結構

```
tests/
├── conftest.py                 # 共用的 fixtures 和配置
├── unit/
│   └── test_models.py          # 資料庫 schema 驗證測試
└── api/
    ├── test_user_api.py        # 使用者 API 測試
    ├── test_cart_api.py        # 購物車 API 測試
    └── test_vendor_api.py      # 商家 API 測試
```

## 測試涵蓋範圍

### User API (`/api/user/*`)
- ✅ 使用者註冊（customer, vendor, admin）
- ✅ 使用者登入
- ✅ 使用者登出
- ✅ 更新個人資料
- ✅ 更新密碼
- ✅ 刪除使用者
- ✅ 驗證重複 email/phone 檢查
- ✅ 驗證必填欄位檢查

### Cart API (`/api/cart/*`)
- ✅ 加入購物車
- ✅ 查看購物車
- ✅ 移除購物車項目
- ✅ 跨店購物驗證
- ✅ 完整購物流程測試（加入 → 查看 → 移除）

### Vendor API (`/api/vendor/*`)
- ✅ 新增商品
- ✅ 更新商品資訊
- ✅ 取得商家所有商品
- ✅ 新增折扣政策
- ✅ 查看折扣政策
- ✅ 完整商品生命週期測試

## Fixtures 使用

### 資料庫 Fixtures
- `app`: 測試用的 Flask 應用程式
- `session`: 自動 rollback 的資料庫 session
- `client`: Flask 測試客戶端

### 使用者 Fixtures
- `test_admin`: 測試用管理員
- `test_vendor`: 測試用商家（含 manager）
- `test_customer`: 測試用顧客
- `vendor_manager`: 測試用商家經理

### 已認證的 Client Fixtures
- `authenticated_client`: 以 customer 身份登入的 client
- `admin_client`: 以 admin 身份登入的 client
- `vendor_client`: 以 vendor 身份登入的 client

### 商品 Fixtures
- `test_product`: 測試商品 1
- `test_product_2`: 測試商品 2

## 📝 如何寫測試：完整教學

### 步驟 1: 確定測試目標

在寫測試前，先問自己：
- 這個 API 做什麼？
- 成功的情況應該回傳什麼？
- 失敗的情況有哪些？（缺少參數、權限不足、資料不存在等）

### 步驟 2: 選擇正確的測試檔案

根據 API 的類型，選擇或建立對應的測試檔案：
- User API → `tests/api/test_user_api.py`
- Cart API → `tests/api/test_cart_api.py`
- Vendor API → `tests/api/test_vendor_api.py`
- 新的 API → 建立 `tests/api/test_新名稱_api.py`

### 步驟 3: 建立測試類別

```python
import pytest
import json

class Test你的功能名稱:
    """測試 XXX 功能的測試套件"""

    def test_成功案例(self, client, test_customer):
        """測試成功的情況"""
        pass

    def test_失敗案例(self, client):
        """測試失敗的情況"""
        pass
```

### 步驟 4: 選擇正確的 Client Fixture

根據 API 的權限需求選擇：

| API 需要的權限 | 使用的 Fixture | 說明 |
|--------------|---------------|------|
| 不需要登入 | `client` | 未登入的訪客 |
| Customer 權限 | `authenticated_client` | 以 customer 身份登入 |
| Vendor 權限 | `vendor_client` | 以 vendor 身份登入 |
| Admin 權限 | `admin_client` | 以 admin 身份登入 |

**範例：檢查你的 controller**
```python
# 如果你的 controller 有這個：
@require_login(role = ["vendor"])
def my_function():
    pass

# 那麼測試要用：
def test_my_function(self, vendor_client, test_vendor):
    # 使用 vendor_client
```

### 步驟 5: 編寫測試

#### 基本測試結構
```python
def test_功能名稱_成功(self, client, test_customer):
    """簡短描述這個測試在測什麼"""

    # 1. 準備測試資料 (Arrange)
    payload = {
        "customer_id": test_customer.id,
        "field": "value"
    }

    # 2. 執行要測試的操作 (Act)
    response = client.post(
        '/api/endpoint',
        data=json.dumps(payload),
        content_type='application/json'
    )

    # 3. 驗證結果 (Assert)
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert data['message'] == "預期的訊息"
```

### 步驟 6: 使用可用的 Fixtures

#### 常用 Fixtures 列表

```python
# === 使用者 Fixtures ===
def test_example(self, test_customer):
    # test_customer 是一個已建立的 Customer 物件
    print(test_customer.id)        # 使用者 ID
    print(test_customer.email)     # customer@test.com
    print(test_customer.name)      # Test Customer

def test_example2(self, test_vendor):
    # test_vendor 是一個已建立的 Vendor 物件
    print(test_vendor.id)

def test_example3(self, test_admin):
    # test_admin 是一個已建立的 Admin 物件
    print(test_admin.id)

# === 商品 Fixtures ===
def test_example4(self, test_product):
    # test_product 是一個已建立的 Product 物件
    print(test_product.id)
    print(test_product.name)       # Test Bubble Tea
    print(test_product.price)      # 50

# === 認證 Client Fixtures ===
def test_example5(self, authenticated_client):
    # 已以 customer 身份登入的 client
    response = authenticated_client.get('/api/user/profile')
```

### 步驟 7: 常見測試模式

#### 模式 1: 測試成功案例
```python
def test_add_item_success(self, authenticated_client, test_product):
    """測試成功新增商品"""
    payload = {
        "product_id": test_product.id,
        "quantity": 2
    }

    response = authenticated_client.post(
        '/api/cart/add',
        data=json.dumps(payload),
        content_type='application/json'
    )

    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
```

#### 模式 2: 測試缺少必填欄位
```python
def test_add_item_missing_quantity(self, authenticated_client, test_product):
    """測試缺少 quantity 欄位時失敗"""
    payload = {
        "product_id": test_product.id
        # 故意不給 quantity
    }

    response = authenticated_client.post(
        '/api/cart/add',
        data=json.dumps(payload),
        content_type='application/json'
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert 'quantity' in data['message'].lower()
```

#### 模式 3: 測試權限不足
```python
def test_add_product_without_auth(self, client, test_vendor):
    """測試未登入時無法新增商品"""
    payload = {
        "vendor_id": test_vendor.id,
        "name": "New Product"
    }

    # 使用未登入的 client
    response = client.post(
        '/api/vendor/Add_Product',
        data=json.dumps(payload),
        content_type='application/json'
    )

    assert response.status_code == 401  # Unauthorized
    data = response.get_json()
    assert data['success'] is False
```

#### 模式 4: 測試資料不存在
```python
def test_get_nonexistent_product(self, authenticated_client):
    """測試查詢不存在的商品"""
    response = authenticated_client.get('/api/product/999999')

    assert response.status_code == 404
    data = response.get_json()
    assert data['success'] is False
```

#### 模式 5: 測試重複資料
```python
def test_register_duplicate_email(self, client, test_customer):
    """測試重複的 email 無法註冊"""
    payload = {
        "name": "New User",
        "email": test_customer.email,  # 使用已存在的 email
        "password": "password123",
        "phone_number": "0999999999"
    }

    response = client.post(
        '/api/user/register',
        data=json.dumps(payload),
        content_type='application/json'
    )

    assert response.status_code == 400
    data = response.get_json()
    assert data['success'] is False
    assert 'email' in data['message'].lower()
```

### 步驟 8: 完整範例 - 從頭到尾寫一個測試

假設你要測試一個新的「加入最愛」功能：

```python
# tests/api/test_favorite_api.py
import pytest
import json

class TestAddFavorite:
    """測試加入最愛功能"""

    def test_add_favorite_success(self, authenticated_client, test_product):
        """測試成功加入最愛"""
        # Arrange: 準備資料
        payload = {
            "product_id": test_product.id
        }

        # Act: 執行操作
        response = authenticated_client.post(
            '/api/favorite/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # Assert: 驗證結果
        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'favorite_id' in data
        assert data['message'] == "Added to favorites successfully"

    def test_add_favorite_without_login(self, client, test_product):
        """測試未登入無法加入最愛"""
        payload = {"product_id": test_product.id}

        response = client.post(
            '/api/favorite/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_add_favorite_missing_product_id(self, authenticated_client):
        """測試缺少 product_id"""
        payload = {}  # 空的 payload

        response = authenticated_client.post(
            '/api/favorite/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False

    def test_add_favorite_duplicate(self, authenticated_client, test_product):
        """測試重複加入最愛"""
        payload = {"product_id": test_product.id}

        # 第一次加入
        response1 = authenticated_client.post(
            '/api/favorite/add',
            data=json.dumps(payload),
            content_type='application/json'
        )
        assert response1.status_code == 200

        # 第二次加入（重複）
        response2 = authenticated_client.post(
            '/api/favorite/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # 根據你的需求，可能回傳 409 或 200
        assert response2.status_code in [200, 409]
```

### 步驟 9: 執行你的測試

```bash
# 執行你剛寫的測試檔案
pytest tests/api/test_favorite_api.py -v

# 只執行某個測試類別
pytest tests/api/test_favorite_api.py::TestAddFavorite -v

# 只執行某個測試函數
pytest tests/api/test_favorite_api.py::TestAddFavorite::test_add_favorite_success -v
```

## ✅ 測試檢查清單

寫完測試後，檢查：
- [ ] 有測試成功的情況嗎？
- [ ] 有測試失敗的情況嗎？（缺少參數、錯誤資料等）
- [ ] 有測試權限控制嗎？（如果 API 需要登入）
- [ ] 測試名稱清楚描述在測什麼嗎？
- [ ] 每個測試都有 docstring 說明嗎？
- [ ] 使用了正確的 client fixture 嗎？
- [ ] 測試可以獨立執行嗎？（不依賴其他測試的順序）

## 🎯 測試命名慣例

```python
# ✅ 好的命名
def test_login_success(self):
def test_login_wrong_password(self):
def test_add_to_cart_missing_product_id(self):

# ❌ 不好的命名
def test_1(self):
def test_function(self):
def test_it_works(self):
```

命名格式：`test_<功能>_<情境>`
- 例如：`test_register_duplicate_email`
- 例如：`test_update_product_without_permission`

## 測試資料庫設定

### 選項 1: 使用開發資料庫（預設）
測試會使用 `.env` 中的 `DATABASE_URL`

**注意**：測試會在資料庫中留下測試數據。有三種方式清理：

```bash
# 方法 1: 使用清理腳本（推薦，不需要啟動 server）
uv run python tests/cleanup_test_data.py --direct

# 方法 2: 透過 API（需要先啟動 server）
curl http://localhost:5000/api/test/Clear

# 方法 3: 在瀏覽器訪問
# http://localhost:5000/api/test/Clear
```

清理腳本會刪除**所有**測試數據（users、products、carts 等）。

### 選項 2: 使用獨立測試資料庫（建議）
在 `.env` 中加入：
```bash
TEST_DATABASE_URL=mysql://user:password@localhost:3306/silkroad_test
```

這樣測試數據和開發數據完全分離，可以隨時刪除整個測試資料庫重建。

## 進階用法

### 執行特定模式的測試
```bash
# 預覽會執行哪些測試（不實際執行）
pytest -k "login" --collect-only

# 執行包含 "login" 的測試
pytest -k "login"

# 執行包含 "cart" 的測試
pytest -k "cart"

# 執行包含 "register" 的測試
pytest -k "register"

# 組合條件：執行 login 或 register
pytest -k "login or register"

# 排除某些測試：執行所有測試但排除 integration
pytest -k "not integration"
```

### 查看測試覆蓋率
```bash
# 安裝 coverage 套件
pip install pytest-cov

# 執行並生成 HTML 報告
pytest --cov=src --cov-report=html

# 查看報告
open htmlcov/index.html
```

### 平行執行測試（加速）
```bash
# 安裝 pytest-xdist
pip install pytest-xdist

# 自動使用所有 CPU 核心
pytest -n auto
```

## 常見問題

### Q: 測試失敗說找不到資料庫？
A: 確認 `.env` 中有設定 `DATABASE_URL`，或是設定 `TEST_DATABASE_URL`

### Q: 測試會影響我的開發資料嗎？
A: 不會！每個測試都會在獨立的 transaction 中執行，測試結束後自動 rollback

### Q: 如何只測試我剛寫的功能？
A: 使用 `-k` 參數：`pytest -k "my_function_name"`

### Q: 測試太慢了怎麼辦？
A:
1. 只執行你需要的測試：`pytest tests/api/test_user_api.py`
2. 使用平行執行：`pytest -n auto`
3. 考慮使用記憶體資料庫（SQLite）加速
