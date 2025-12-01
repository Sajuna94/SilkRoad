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


class TestUserRegistration:
    """Test suite for user registration endpoint."""

    def test_register_customer_good(self, client, register_payload):
        """Test successful customer registration."""
        response = client.post(
            '/api/user/register',
            data=json.dumps(register_payload),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'user_id' in data

    def test_register_vendor_good(self, app, client):
        """Test successful vendor registration."""

        payload = {
            "role": "vendor",
            "name": "New Vendor",
            "email": "newvendor@test.com",
            "password": "password123",
            "phone_number": "0944444444",
            "address": "Vendor Address",
            "is_active": True,
            "manager": {
                "name": "new_vendor_mgr",
                "email": "manager@email.com",
                "phone_number": "0912345678"
            }
        }

        response = client.post(
            '/api/user/register',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'user_id' in data

    def test_register_duplicate_email_bad(self, app, client, test_customer, register_payload):
        """同個email重複註冊"""
        from models import Customer

        # Get customer email from database
        with app.app_context():
            customer = Customer.query.get(test_customer)
            customer_email = customer.email

        register_payload['email'] = customer_email

        response = client.post(
            '/api/user/register',
            data=json.dumps(register_payload),
            content_type='application/json'
        )

        assert response.status_code == 409
        data = response.get_json()
        assert data['success'] is False
        assert 'Email or Phonenumber has been registered' in data['message']

    def test_register_duplicate_phone_bad(self, app, client, test_customer, register_payload):
        """Test registration fails with duplicate phone number."""
        from models import Customer

        # Get customer phone from database
        with app.app_context():
            customer = Customer.query.get(test_customer)
            customer_phone = customer.phone_number

        register_payload['phone_number'] = customer_phone

        response = client.post(
            '/api/user/register',
            data=json.dumps(register_payload),
            content_type='application/json'
        )

        assert response.status_code == 409
        data = response.get_json()
        assert data['success'] is False
        assert 'Email or Phonenumber has been registered' in data['message']

    def test_register_missing_fields(self, client):
        """Test registration fails when required fields are missing."""
        payload = {
            "role": "customer",
            "name": "Incomplete User"
            # Missing email, password, phone_number
        }

        response = client.post(
            '/api/user/register',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False


class TestUserLogin:
    """Test suite for user login endpoint."""

    def test_login_success(self, app, client, test_customer):
        """Test successful login."""
        from models import Customer

        # Get customer details from database
        with app.app_context():
            customer = Customer.query.get(test_customer)
            customer_email = customer.email
            customer_role = customer.role

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
        assert data['data']['id'] == test_customer
        assert data['data']['email'] == customer_email
        assert data['data']['role'] == customer_role

    def test_login_wrong_password(self, app, client, test_customer):
        """Test login fails with wrong password."""
        from models import Customer

        # Get customer email from database
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
        assert data['data']['name'] == "Updated Name"
        assert data['data']['phone_number'] == "0955555555"

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
        assert data['data']['address'] == "New Address 999"

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

        assert response.status_code == 400
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
