"""
API Tests for User endpoints (/api/user/*).

Tests cover:
- User registration (customer, vendor, admin)
- User login
- User logout
- User profile update
- Password update
- User deletion
"""
import pytest
import json
import uuid
import random

class TestUserRegistration:
    """Test suite for user registration endpoint (Two-Step Process)."""

    def test_register_customer_good(self, client):
        """Test successful customer registration (Step 1 + Step 2)."""
        
        # 1. 準備隨機資料
        unique_id = str(uuid.uuid4())[:8]
        random_phone = f"09{random.randint(10000000, 99999999)}"

        # --- Step 1: Common Info ---
        # Route: /api/user/register/guest
        step1_payload = {
            "role": "customer",
            "email": f"cust_{unique_id}@test.com",
            "password": "password123",
            "phone_number": random_phone
        }

        response_step1 = client.post(
            '/api/user/register/guest',
            data=json.dumps(step1_payload),
            content_type='application/json'
        )
        
        if response_step1.status_code != 201:
            print(f"\n[Debug] Step 1 Failed: {response_step1.get_json()}")
        assert response_step1.status_code == 201


        # --- Step 2: Specific Info ---
        # Route: /api/user/register/customer
        step2_payload = {
            "name": f"Customer_{unique_id}", # name 現在由 step 2 傳入
            "address": "Taipei City 101"
        }

        response_step2 = client.post(
            '/api/user/register/customer', 
            data=json.dumps(step2_payload),
            content_type='application/json'
        )

        if response_step2.status_code != 201:
            print(f"\n[Debug] Step 2 Failed: {response_step2.get_json()}")

        assert response_step2.status_code == 201
        
        # 驗證資料
        data_step2 = response_step2.get_json()
        assert data_step2['success'] is True
        user_data = data_step2['data'][0]
        assert user_data['role'] == 'customer'
        assert user_data['name'] == step2_payload['name']

    def test_register_vendor_good(self, client):
        """Test successful vendor registration."""
        
        unique_id = str(uuid.uuid4())[:8]
        random_phone = f"09{random.randint(10000000, 99999999)}"

        # --- Step 1 ---
        step1_payload = {
            "role": "vendor",
            "email": f"vendor_{unique_id}@test.com",
            "password": "password123",
            "phone_number": random_phone
        }

        response_step1 = client.post(
            '/api/user/register/guest',
            data=json.dumps(step1_payload),
            content_type='application/json'
        )
        assert response_step1.status_code == 201

        # --- Step 2 ---
        # Route: /api/user/register/vendor
        step2_payload = {
            "name": f"Vendor_{unique_id}",
            "address": "Vendor Factory Address",
            "manager": {
                "name": "Vendor Boss",
                "email": f"boss_{unique_id}@vendor.com",
                "phone_number": f"09{random.randint(10000000, 99999999)}"
            }
        }

        response_step2 = client.post(
            '/api/user/register/vendor', 
            data=json.dumps(step2_payload),
            content_type='application/json'
        )

        if response_step2.status_code != 201:
             print(f"\n[Debug] Step 2 Failed: {response_step2.get_json()}")

        assert response_step2.status_code == 201
        
        data_step2 = response_step2.get_json()
        assert data_step2['success'] is True
        
        user_data = data_step2['data'][0]
        assert user_data['role'] == 'vendor'
        assert user_data['manager']['email'] == step2_payload['manager']['email']

    def test_register_role_mismatch(self, client):
        """Test that Step 2 fails if URL role matches Step 1 role."""
        
        # Step 1: Register as Customer
        step1_payload = {
            "role": "customer",
            "email": f"mismatch_{uuid.uuid4()}@test.com",
            "password": "123",
            "phone_number": f"09{random.randint(10000000, 99999999)}"
        }
        client.post('/api/user/register/guest', json=step1_payload)

        # Step 2: Try to hit Vendor endpoint
        step2_payload = {"name": "Test", "address": "Test"}
        response = client.post('/api/user/register/vendor', json=step2_payload)

        assert response.status_code == 400
        assert "Role mismatch" in response.get_json()['message']

    def test_register_duplicate_email_bad(self, app, client, test_customer):
        """Test registration fails at Step 1 when email already exists."""
        from models.auth.customer import Customer

        with app.app_context():
            customer = Customer.query.get(test_customer)
            existing_email = customer.email

        payload = {
            "role": "customer",
            "email": existing_email, # Duplicate
            "password": "password123",
            "phone_number": "0900000001"
        }

        response = client.post(
            '/api/user/register/guest',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 409
        assert 'Email has been registered' in response.get_json()['message']
    def test_register_step1_duplicate_phone(self, app, client, test_customer):
        """測試 Step 1: 手機號碼重複應失敗"""
        from models.auth.customer import Customer
        with app.app_context():
            phone = Customer.query.get(test_customer).phone_number

        payload = {
            "role": "customer",
            "email": f"unique_{uuid.uuid4()}@test.com",
            "password": "123",
            "phone_number": phone # 使用已存在的電話
        }
        response = client.post('/api/user/register/guest', json=payload)
        assert response.status_code == 409
        assert "Phone number has been registered" in response.get_json()['message']

    def test_register_step1_missing_fields(self, client):
        """測試 Step 1: 欄位缺失"""
        payload = {"role": "customer", "email": "test@test.com"} # 少了 password, phone
        response = client.post('/api/user/register/guest', json=payload)
        assert response.status_code == 400

    def test_register_step2_missing_address(self, client):
        """測試 Step 2 (Customer): 沒傳地址應失敗"""
        # 先跑 Step 1 建立 Session
        client.post('/api/user/register/guest', json={
            "role": "customer", "email": f"t{uuid.uuid4()}@t.com", "password": "123", "phone_number": "0900111222"
        })
        # Step 2 少傳 address
        response = client.post('/api/user/register/customer', json={"name": "No Address"})
        assert response.status_code == 400
        assert "Customer needs address" in response.get_json()['message']

    def test_register_step2_no_session(self, client):
        """測試 Step 2: 沒有 Step 1 Session 直接打接口"""
        response = client.post('/api/user/register/customer', json={"address": "Taipei", "name": "Test"})
        assert response.status_code == 400
        assert "Session expired" in response.get_json()['message']

    def test_register_vendor_existing_manager(self, app, client, vendor_manager):
        """測試 Vendor 註冊: 使用已存在的 Manager (邏輯覆蓋)"""
        # 1. 取得現有 Manager 資料
        from models.auth.vendor_manager import Vendor_Manager
        with app.app_context():
            mgr = Vendor_Manager.query.get(vendor_manager)
            mgr_email = mgr.email
            mgr_phone = mgr.phone_number

        # 2. 註冊新 Vendor，但填入相同的 Manager Email
        client.post('/api/user/register/guest', json={
            "role": "vendor", 
            "email": f"v_new_{uuid.uuid4()}@t.com", 
            "password": "123", 
            "phone_number": f"09{random.randint(10000000, 99999999)}"
        })
        
        step2_payload = {
            "name": "New Vendor",
            "address": "Address",
            "manager": {
                "name": "Old Manager Name", 
                "email": mgr_email, # 重複 Email
                "phone_number": mgr_phone
            }
        }
        response = client.post('/api/user/register/vendor', json=step2_payload)
        assert response.status_code == 201
        
        # 驗證邏輯: 應該要 reuse ID，而不是報錯
        data = response.get_json()['data'][0]
        assert data['manager']['id'] == vendor_manager # ID 應該要跟舊的一樣


class TestUserLogin:
    """Test suite for user login endpoint."""

    def test_login_customer_success(self, app, client, test_customer):
        """Test successful customer login and verify role-specific data."""
        from models.auth.customer import Customer

        with app.app_context():
            customer = Customer.query.get(test_customer)
            customer_email = customer.email
            customer_address = customer.address 

        payload = {
            "email": customer_email,
            "password": "customer123"
        }

        response = client.post(
            '/api/user/login',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        user_data = data['data'][0]
        assert user_data['id'] == test_customer
        assert user_data['role'] == 'customer'
        assert user_data['address'] == customer_address
        assert 'membership_level' in user_data

    def test_login_vendor_success(self, app, client, test_vendor):
        """Test successful vendor login and verify manager info."""
        from models.auth.vendor import Vendor

        with app.app_context():
            vendor = Vendor.query.get(test_vendor)
            vendor_email = vendor.email

        payload = {
            "email": vendor_email,
            "password": "vendor123"
        }

        response = client.post(
            '/api/user/login',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        user_data = data['data'][0]
        assert user_data['role'] == 'vendor'
        assert 'manager' in user_data
        assert user_data['manager'] is not None

    def test_login_wrong_password(self, app, client, test_customer):
        from models.auth.customer import Customer
        with app.app_context():
            email = Customer.query.get(test_customer).email

        response = client.post('/api/user/login', json={
            "email": email,
            "password": "wrongpassword"
        })
        assert response.status_code == 401
    def test_login_non_existent(self, client):
        """測試登入不存在的帳號"""
        response = client.post('/api/user/login', json={
            "email": "ghost@test.com", "password": "123"
        })
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        """測試登入缺欄位"""
        response = client.post('/api/user/login', json={"email": "only@email.com"})
        assert response.status_code == 400


class TestUserLogout:
    """Test suite for user logout endpoint."""

    def test_logout_success(self, authenticated_client):
        response = authenticated_client.post('/api/user/logout')
        assert response.status_code == 200
        assert response.get_json()['success'] is True


class TestUserUpdate:
    """Test suite for user profile update endpoint (/me)."""

    def test_update_profile_success(self, authenticated_client):
        """Test successful profile update via PATCH /me."""
        
        # 隨機產生一個新名字和電話，確保不重複
        new_name = f"Updated_{str(uuid.uuid4())[:4]}"
        new_phone = f"09{random.randint(10000000, 99999999)}"

        payload = {
            "name": new_name,
            "phone_number": new_phone
        }

        # 使用 PATCH 方法，路徑為 /api/user/me
        response = authenticated_client.patch(
            '/api/user/me',
            data=json.dumps(payload),
            content_type='application/json'
        )

        if response.status_code != 200:
             print(f"\n[Debug] Update Failed: {response.get_json()}")

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        # 驗證回傳資料
        user_data = data['data'][0]
        assert user_data['name'] == new_name
        assert user_data['phone_number'] == new_phone

    def test_update_customer_address(self, authenticated_client):
        """Test updating customer address via PATCH /me."""
        payload = {
            "address": "New Address 999"
        }

        response = authenticated_client.patch(
            '/api/user/me',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['data'][0]['address'] == "New Address 999"

    def test_update_unauthorized_bad(self, client):
        """Test update fails without authentication (no session)."""
        payload = {"name": "Hacker"}

        # 沒有登入 (client) 直接打 /me
        response = client.patch(
            '/api/user/me',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401

    def test_update_phone_duplicate_bad(self, app, authenticated_client, test_customer, test_vendor):
        """測試 Update: 修改電話為他人已使用的號碼應失敗"""
        # 取得另一個使用者的電話 (這裡是 Vendor 的)
        from models.auth.vendor import Vendor
        with app.app_context():
            other_phone = Vendor.query.get(test_vendor).phone_number

        # 嘗試將 Customer 的電話改成 Vendor 的電話
        response = authenticated_client.patch('/api/user/me', json={
            "phone_number": other_phone
        })
        assert response.status_code == 409
        assert "Phone number already in use" in response.get_json()['message']


class TestPasswordUpdate:
    """Test suite for password update endpoint (/me/password)."""

    def test_update_password_success(self, authenticated_client):
        """Test successful password update via PATCH /me/password."""
        payload = {
            "old_password": "customer123", # 這是 conftest 裡預設的
            "new_password": "newpassword456"
        }

        response = authenticated_client.patch(
            '/api/user/me/password',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        assert response.get_json()['success'] is True

    def test_update_password_wrong_old_password(self, authenticated_client):
        """Test password update fails with wrong old password."""
        payload = {
            "old_password": "wrongpassword",
            "new_password": "newpassword456"
        }

        response = authenticated_client.patch(
            '/api/user/me/password',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401


class TestUserDeletion:
    """Test suite for user deletion endpoint."""

    def test_delete_user_success(self, authenticated_client, test_customer):
        """Test successful user deletion."""
        # 雖然是用 authenticated_client (Customer)，但此 API 允許刪除任何 ID?
        # 根據你的 Controller 邏輯: user = User.query.get(user_id)
        # 如果你希望只能刪除自己，Controller 邏輯可能需要檢查 current_user_id == user_id
        # 這裡照著你的 Controller 邏輯測試
        
        response = authenticated_client.delete(f'/api/user/delete/{test_customer}')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_delete_user_unauthorized(self, client, test_customer):
        """Test user deletion fails without authentication."""
        response = client.delete(f'/api/user/delete/{test_customer}')
        assert response.status_code == 401
