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
        step1_payload = {
            "role": "customer",
            "name": f"Customer_{unique_id}",
            "email": f"cust_{unique_id}@test.com",
            "password": "password123",
            "phone_number": random_phone
        }

        response_step1 = client.post(
            '/api/user/register/step1',
            data=json.dumps(step1_payload),
            content_type='application/json'
        )
        
        # 除錯：如果 Step 1 失敗，印出原因
        if response_step1.status_code != 201:
            print(f"\n[Debug] Step 1 Failed: {response_step1.get_json()}")
        assert response_step1.status_code == 201


        # --- Step 2: Specific Info ---
        step2_payload = {
            "address": "Taipei City 101"
        }

        # [⚠️ 重要修正] 網址必須是 /customer，不能是 /step2
        response_step2 = client.post(
            '/api/user/register/customer', 
            data=json.dumps(step2_payload),
            content_type='application/json'
        )

        # 除錯：如果 Step 2 失敗，印出原因 (這會告訴你為什麼是 400)
        if response_step2.status_code != 201:
            print(f"\n[Debug] Step 2 Failed: {response_step2.get_json()}")

        assert response_step2.status_code == 201
        
        # 驗證資料
        data_step2 = response_step2.get_json()
        assert data_step2['success'] is True
        assert data_step2['data'][0]['role'] == 'customer'

    def test_register_vendor_good(self, client):
        """Test successful vendor registration."""
        
        unique_id = str(uuid.uuid4())[:8]
        random_phone = f"09{random.randint(10000000, 99999999)}"

        # --- Step 1 ---
        step1_payload = {
            "role": "vendor",
            "name": f"Vendor_{unique_id}",
            "email": f"vendor_{unique_id}@test.com",
            "password": "password123",
            "phone_number": random_phone
        }

        response_step1 = client.post(
            '/api/user/register/step1',
            data=json.dumps(step1_payload),
            content_type='application/json'
        )
        assert response_step1.status_code == 201

        # --- Step 2 ---
        step2_payload = {
            "address": "Vendor Factory Address",
            "manager": {
                "name": "Vendor Boss",
                "email": f"boss_{unique_id}@vendor.com",
                "phone_number": f"09{random.randint(10000000, 99999999)}"
            }
        }

        # [⚠️ 重要修正] 網址必須是 /vendor，不能是 /step2
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
        assert data_step2['data'][0]['role'] == 'vendor'

    def test_register_duplicate_email_bad(self, app, client, test_customer):
        """
        Test registration fails at Step 1 when email already exists.
        (We fail fast at step 1 now)
        """
        from models.auth.customer import Customer

        # Get existing customer email
        with app.app_context():
            customer = Customer.query.get(test_customer)
            existing_email = customer.email

        payload = {
            "role": "customer",
            "name": "Duplicate User",
            "email": existing_email, # Duplicate
            "password": "password123",
            "phone_number": "0900000001" # Unique
        }

        response = client.post(
            '/api/user/register/step1',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 409
        data = response.get_json()
        assert data['success'] is False
        assert 'Email has been registered' in data['message']

    def test_register_duplicate_phone_bad(self, app, client, test_customer):
        """
        Test registration fails at Step 1 when phone number already exists.
        """
        from models.auth.customer import Customer

        # Get existing customer phone
        with app.app_context():
            customer = Customer.query.get(test_customer)
            existing_phone = customer.phone_number

        payload = {
            "role": "customer",
            "name": "Duplicate Phone User",
            "email": "unique@test.com", # Unique
            "password": "password123",
            "phone_number": existing_phone # Duplicate
        }

        response = client.post(
            '/api/user/register/step1',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 409
        data = response.get_json()
        assert data['success'] is False
        assert 'Phone number has been registered' in data['message']

    def test_register_step1_missing_fields(self, client):
        """Test Step 1 fails when required fields are missing."""
        payload = {
            "role": "customer",
            "name": "Incomplete User"
            # Missing email, password, phone_number
        }

        response = client.post(
            '/api/user/register/step1',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False

    def test_register_step2_without_step1(self, client):
        """
        Test calling Step 2 directly without Step 1 session.
        This simulates a user skipping the process or session expiry.
        """
        payload = {
            "address": "Some Address"
        }

        # 直接呼叫 step2，沒有經過 step1，所以沒有 cookie
        response = client.post(
            '/api/user/register/step2',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # 預期被拒絕 (400 Bad Request)
        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert "Step 1 not completed" in data['message']


class TestUserLogin:
    """Test suite for user login endpoint."""

    def test_login_customer_success(self, app, client, test_customer):
        """Test successful customer login and verify role-specific data."""
        from models.auth.customer import Customer

        # Get customer details from database
        with app.app_context():
            customer = Customer.query.get(test_customer)
            customer_email = customer.email
            customer_address = customer.address # 驗證地址用

        payload = {
            "email": customer_email,
            "password": "customer123" # 對應 conftest 中建立時的密碼
        }

        response = client.post(
            '/api/user/login',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        # 取得回傳的使用者資料物件
        user_data = data['data'][0]

        # 1. 驗證基本資料
        assert user_data['id'] == test_customer
        assert user_data['email'] == customer_email
        assert user_data['role'] == 'customer'
        
        # 2. 驗證 Customer 特有欄位 (依照新的 API 邏輯)
        assert 'address' in user_data
        assert user_data['address'] == customer_address
        assert 'membership_level' in user_data

    def test_login_vendor_success(self, app, client, test_vendor):
        """Test successful vendor login and verify manager info."""
        from models.auth.vendor import Vendor

        # Get vendor details
        with app.app_context():
            vendor = Vendor.query.get(test_vendor)
            vendor_email = vendor.email

        payload = {
            "email": vendor_email,
            "password": "vendor123" # 對應 conftest 中建立時的密碼
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

        # 1. 驗證基本資料
        assert user_data['id'] == test_vendor
        assert user_data['role'] == 'vendor'

        # 2. 驗證 Vendor 特有欄位 (Manager 資訊)
        assert 'manager' in user_data
        assert user_data['manager'] is not None
        # 檢查 Manager 內部的欄位是否存在
        assert 'name' in user_data['manager']
        assert 'phone_number' in user_data['manager']

    def test_login_wrong_password(self, app, client, test_customer):
        """Test login fails with wrong password."""
        from models.auth.customer import Customer

        with app.app_context():
            customer = Customer.query.get(test_customer)
            customer_email = customer.email

        payload = {
            "email": customer_email,
            "password": "wrongpassword"
        }

        response = client.post(
            '/api/user/login',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_login_nonexistent_user(self, client):
        """Test login fails for non-existent user."""
        payload = {
            "email": "nonexistent@test.com",
            "password": "password123"
        }

        response = client.post(
            '/api/user/login',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_login_missing_credentials(self, client):
        """Test login fails when credentials are missing."""
        payload = {"email": "test@test.com"}

        response = client.post(
            '/api/user/login',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False


class TestUserLogout:
    """Test suite for user logout endpoint."""

    def test_logout_success(self, authenticated_client):
        """Test successful logout."""
        response = authenticated_client.post('/api/user/logout')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'Logout successful' in data['message']


class TestUserUpdate:
    """Test suite for user profile update endpoint."""

    def test_update_profile_success(self, authenticated_client, test_customer):
        """Test successful profile update."""
        payload = {
            "name": "Updated Name",
            "phone_number": "0955555555"
        }

        response = authenticated_client.put(
            f'/api/user/update/{test_customer}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data'][0]['name'] == "Updated Name"
        assert data['data'][0]['phone_number'] == "0955555555"

    def test_update_customer_address(self, authenticated_client, test_customer):
        """Test updating customer address."""
        payload = {
            "address": "New Address 999"
        }

        response = authenticated_client.put(
            f'/api/user/update/{test_customer}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data'][0]['address'] == "New Address 999"

    def test_update_unauthorized_bad(self, client, test_customer):
        """Test update fails without authentication."""
        payload = {"name": "Hacker"}

        response = client.put(
            f'/api/user/update/{test_customer}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False


class TestPasswordUpdate:
    """Test suite for password update endpoint."""

    def test_update_password_success(self, authenticated_client, test_customer):
        """Test successful password update."""
        payload = {
            "old_password": "customer123",
            "new_password": "newpassword456"
        }

        response = authenticated_client.put(
            f'/api/user/update_password/{test_customer}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'Password updated successfully' in data['message']

    def test_update_password_wrong_old_password(self, authenticated_client, test_customer):
        """Test password update fails with wrong old password."""
        payload = {
            "old_password": "wrongpassword",
            "new_password": "newpassword456"
        }

        response = authenticated_client.put(
            f'/api/user/update_password/{test_customer}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False

    def test_update_password_unauthorized(self, client, test_customer):
        """Test password update fails without authentication."""
        payload = {
            "old_password": "customer123",
            "new_password": "newpassword456"
        }

        response = client.put(
            f'/api/user/update_password/{test_customer}',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False


class TestUserDeletion:
    """Test suite for user deletion endpoint."""

    def test_delete_user_success(self, authenticated_client, test_customer):
        """Test successful user deletion."""
        response = authenticated_client.delete(f'/api/user/delete/{test_customer}')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert 'User deleted successfully' in data['message']

    def test_delete_user_unauthorized(self, client, test_customer):
        """Test user deletion fails without authentication."""
        response = client.delete(f'/api/user/delete/{test_customer}')

        assert response.status_code == 401
        data = response.get_json()
        assert data['success'] is False
