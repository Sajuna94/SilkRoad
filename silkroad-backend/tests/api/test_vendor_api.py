"""
API Tests for Vendor endpoints (/api/vendor/*).

Tests cover:
- Add products
- Update products
- Get vendor products
- Add discount policies
- View discount policies
"""

import pytest
import json
from datetime import datetime, timedelta


class TestAddProduct:
    """Test suite for adding products."""

    def test_add_product_good(self, vendor_client, test_vendor):
        """Test successfully adding a product."""
        payload = {
            "vendor_id": test_vendor,  # test_vendor is now ID
            "name": "New Bubble Tea",
            "price": 55,
            "description": "Fresh and delicious",
            "image_url": "https://example.com/new.jpg",
            "is_listed": True
        }

        response = vendor_client.post(
            '/api/vendor/Add_Product',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'id' in data["product"]

    def test_add_product_minimal_bad(self, vendor_client, test_vendor):
        """Test adding product with minimal required fields."""
        payload = {
            "vendor_id": test_vendor,  # test_vendor is now ID
            "name": "good drink",
            "price": 30,
            "description": "Very fresh and delicious",
            "image_url": "https://example.com/new2.jpg"
        }

        response = vendor_client.post(
            '/api/vendor/Add_Product',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # Should succeed with defaults
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True

    def test_add_product_missing_vendor_id(self, vendor_client):
        """Test adding product without vendor_id fails."""
        payload = {
            "name": "Orphan Product",
            "price": 40
        }

        response = vendor_client.post(
            '/api/vendor/Add_Product',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False

    def test_add_product_missing_name(self, vendor_client, test_vendor):
        """Test adding product without name fails."""
        payload = {
            "vendor_id": test_vendor,  # test_vendor is now ID
            "price": 40
        }

        response = vendor_client.post(
            '/api/vendor/Add_Product',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False


class TestGetVendorProducts:
    """Test suite for getting vendor products."""

    def test_get_products_empty(self, authenticated_client, test_vendor):
        """Test getting products when vendor has none."""
        response = authenticated_client.get(f'/api/vendor/{test_vendor}/get_products')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['products'] == []

    def test_get_products_with_items(self, authenticated_client, test_vendor, test_product, test_product_2):
        """Test getting products when vendor has items."""
        response = authenticated_client.get(f'/api/vendor/{test_vendor}/get_products')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['products']) >= 2

        # Verify product structure
        product = data['products'][0]
        assert 'id' in product
        assert 'name' in product
        assert 'price' in product
        assert 'description' in product
        assert 'image_url' in product
        assert 'is_listed' in product

    def test_get_products_nonexistent_vendor(self, authenticated_client):
        """Test getting products for non-existent vendor."""
        response = authenticated_client.get('/api/vendor/99999/get_products')

        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False


class TestUpdateProducts:
    """Test suite for updating products."""

    def test_update_product_name(self, vendor_client, test_product):
        """Test updating product name."""
        payload = [
            {
                "product_id": test_product,
                "behavior": {
                    "col_name": "name",
                    "value": "Updated Tea Name"
                }
            }
        ]

        response = vendor_client.patch(
            '/api/vendor/update_products',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['products'][0]['name'] == "Updated Tea Name"

    def test_update_product_price(self, vendor_client, test_product):
        """Test updating product price."""
        payload = [
            {
                "product_id": test_product,
                "behavior": {
                    "col_name": "price",
                    "value": "60"
                }
            }
        ]

        response = vendor_client.patch(
            '/api/vendor/update_products',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['products'][0]['price'] == 60

    def test_update_product_listing_status(self, vendor_client, test_product):
        """Test toggling product listing status."""
        payload = [
            {
                "product_id": test_product,
                "behavior": {
                    "col_name": "is_listed",
                    "value": "false"
                }
            }
        ]

        response = vendor_client.patch(
            '/api/vendor/update_products',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['products'][0]['is_listed'] is False

    def test_update_product_invalid_column(self, vendor_client, test_product):
        """Test updating with invalid column name fails."""
        payload = [
            {
                "product_id": test_product,
                "behavior": {
                    "col_name": "invalid_column",
                    "value": "test"
                }
            }
        ]

        response = vendor_client.patch(
            '/api/vendor/update_products',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False

    def test_update_nonexistent_product(self, vendor_client):
        """Test updating non-existent product fails."""
        payload = [
            {
                "product_id": 99999,
                "behavior": {
                    "col_name": "name",
                    "value": "Ghost Product"
                }
            }
        ]

        response = vendor_client.patch(
            '/api/vendor/update_products',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False


class TestDiscountPolicy:
    """Test suite for discount policy management."""

    def test_add_discount_policy_success(self, vendor_client, test_vendor):
        """Test successfully adding a discount policy."""
        expiry_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')

        payload = {
            "vendor_id": test_vendor,
            "type": "percent",
            "value": 10,
            "min_purchase": 100,
            "max_discount": 50,
            "membership_limit": 0,
            "expiry_date": expiry_date
        }

        response = vendor_client.post(
            '/api/vendor/add_discount',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'policy_id' in data

    def test_add_discount_missing_fields(self, vendor_client, test_vendor):
        """Test adding discount policy with missing fields fails."""
        payload = {
            "vendor_id": test_vendor,
            "type": "percent"
            # Missing required fields
        }

        response = vendor_client.post(
            '/api/vendor/add_discount',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False

    def test_view_discount_policies_empty(self, authenticated_client, test_vendor):
        """Test viewing discount policies when none exist."""
        payload = {
            "vendor_id": test_vendor
        }

        response = authenticated_client.post(
            '/api/vendor/view_discount',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['policy_amount'] == 0
        assert data['data'] == []

    def test_view_discount_policies_with_data(self, app, authenticated_client, test_vendor):
        """Test viewing discount policies when they exist."""
        from models import Discount_Policy
        from src.config import db

        with app.app_context():
            # Create a test discount policy
            expiry_date = datetime.now() + timedelta(days=30)
            policy = Discount_Policy(
                vendor_id=test_vendor,
                type="percent",
                value=15,
                min_purchase=200,
                max_discount=100,
                membership_limit=0,
                expiry_date=expiry_date
            )
            db.session.add(policy)
            db.session.commit()

        payload = {
            "vendor_id": test_vendor
        }

        response = authenticated_client.post(
            '/api/vendor/view_discount',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['policy_amount'] >= 1
        assert len(data['data']) >= 1

        # Verify policy structure
        policy_data = data['data'][0]
        assert 'policy_id' in policy_data
        assert 'vendor_id' in policy_data
        assert 'type' in policy_data
        assert 'value' in policy_data
        assert 'min_purchase' in policy_data
        assert 'max_discount' in policy_data
        assert 'membership_limit' in policy_data
        assert 'expiry_date' in policy_data


class TestVendorIntegration:
    """Integration tests for vendor workflows."""

    def test_complete_product_lifecycle(self, vendor_client, test_vendor):
        """Test complete product lifecycle: add -> update -> list."""
        import uuid
        # Step 1: Add product
        add_payload = {
            "vendor_id": test_vendor,
            "name": "Lifecycle Test Tea",
            "price": 50,
            "description": "Test product",
            "image_url": f"https://example.com/lifecycle-{str(uuid.uuid4())[:8]}.jpg",
            "is_listed": True
        }

        add_response = vendor_client.post(
            '/api/vendor/Add_Product',
            data=json.dumps(add_payload),
            content_type='application/json'
        )

        assert add_response.status_code == 201
        product_id = add_response.get_json()['product']['id']

        # Step 2: Update product
        update_payload = [
            {
                "product_id": product_id,
                "behavior": {
                    "col_name": "price",
                    "value": "55"
                }
            }
        ]

        update_response = vendor_client.patch(
            '/api/vendor/update_products',
            data=json.dumps(update_payload),
            content_type='application/json'
        )

        assert update_response.status_code == 200
        assert update_response.get_json()['products'][0]['price'] == 55

        # Step 3: Get all products (vendor can view their own products)
        list_response = vendor_client.get(f'/api/vendor/{test_vendor}/get_products')

        assert list_response.status_code == 200
        products = list_response.get_json()['products']
        assert any(p['id'] == product_id for p in products)
