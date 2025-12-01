"""
API Tests for Cart endpoints (/api/cart/*).

Tests cover:
- Add items to cart
- Remove items from cart
- View cart contents
- Cross-vendor cart validation
"""

import pytest
import json


class TestAddToCart:
    """Test suite for add to cart endpoint."""

    def test_add_to_cart_success(self, client, test_customer, test_vendor, test_product):
        """Test successfully adding a product to cart."""
        payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 2,
            "selected_sugar": "normal",
            "selected_ice": "less",
            "selected_size": "medium"
        }

        response = client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_add_to_cart_missing_customer_id(self, client, test_vendor, test_product):
        """Test adding to cart fails without customer_id."""
        payload = {
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1
        }

        response = client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'customer_id' in data['message']

    def test_add_to_cart_missing_vendor_id(self, client, test_customer, test_product):
        """Test adding to cart fails without vendor_id."""
        payload = {
            "customer_id": test_customer,
            "product_id": test_product,
            "quantity": 1
        }

        response = client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert 'vendor_id' in data['message']

    def test_add_multiple_items_same_vendor(self, client, test_customer, test_vendor, test_product, test_product_2):
        """Test adding multiple items from same vendor."""
        # Add first product
        payload1 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1,
            "selected_sugar": "normal",
            "selected_ice": "normal",
            "selected_size": "large"
        }

        response1 = client.post(
            '/api/cart/add',
            data=json.dumps(payload1),
            content_type='application/json'
        )

        assert response1.status_code == 200

        # Add second product
        payload2 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product_2,
            "quantity": 2,
            "selected_sugar": "less",
            "selected_ice": "less",
            "selected_size": "medium"
        }

        response2 = client.post(
            '/api/cart/add',
            data=json.dumps(payload2),
            content_type='application/json'
        )

        assert response2.status_code == 200
        data2 = response2.get_json()
        assert data2['success'] is True


class TestViewCart:
    """Test suite for view cart endpoint."""

    def test_view_empty_cart(self, client, test_customer, test_vendor):
        """Test viewing an empty cart."""
        payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor
        }

        response = client.post(
            '/api/cart/view',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data'] == []
        assert data['total_amount'] == 0
        assert 'empty' in data['message'].lower()

    def test_view_cart_with_items(self, client, test_customer, test_vendor, test_product):
        """Test viewing cart with items."""
        # First add an item
        add_payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 2,
            "selected_sugar": "normal",
            "selected_ice": "less",
            "selected_size": "large"
        }

        client.post(
            '/api/cart/add',
            data=json.dumps(add_payload),
            content_type='application/json'
        )

        # Then view cart
        view_payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor
        }

        response = client.post(
            '/api/cart/view',
            data=json.dumps(view_payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['data']) > 0
        assert data['total_amount'] > 0

        # Verify item structure
        item = data['data'][0]
        assert 'cart_item_id' in item
        assert 'product_id' in item
        assert 'product_name' in item
        assert 'price' in item
        assert 'quantity' in item
        assert 'subtotal' in item
        assert item['selected_sugar'] == "normal"
        assert item['selected_ice'] == "less"

    def test_view_cart_cross_vendor_conflict(self, session, client, test_customer, test_vendor, vendor_manager):
        """Test viewing cart with cross-vendor conflict."""
        # Create a second vendor
        from models import Vendor
        from werkzeug.security import generate_password_hash

        vendor2 = Vendor(
            name="Second Vendor",
            email="vendor2@test.com",
            password=generate_password_hash("password"),
            phone_number="0988888888",
            address="Address 2",
            vendor_manager_id=vendor_manager.id,
            is_active=True,
            role="vendor"
        )
        session.add(vendor2)
        session.commit()

        # Add item from first vendor
        from models import Cart
        cart = Cart(customer_id=test_customer, vendor_id=test_vendor)
        session.add(cart)
        session.commit()

        # Try to view with different vendor_id
        payload = {
            "customer_id": test_customer,
            "vendor_id": vendor2.id
        }

        response = client.post(
            '/api/cart/view',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert '跨店' in data['message'] or 'cross' in data['message'].lower()


class TestRemoveFromCart:
    """Test suite for remove from cart endpoint."""

    def test_remove_from_cart_success(self, session, client, test_customer, test_vendor, test_product):
        """Test successfully removing an item from cart."""
        # First add an item
        from models import Cart, Cart_Item

        cart = Cart(customer_id=test_customer, vendor_id=test_vendor)
        session.add(cart)
        session.commit()

        cart_item = Cart_Item(
            cart_id=cart.customer_id,
            product_id=test_product,
            quantity=2,
            selected_sugar="normal",
            selected_ice="normal",
            selected_size="medium"
        )
        session.add(cart_item)
        session.commit()

        # Now remove it
        payload = {
            "cart_item_id": cart_item.id,
            "customer_id": test_customer
        }

        response = client.post(
            '/api/cart/remove',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_remove_nonexistent_item(self, client, test_customer):
        """Test removing non-existent cart item."""
        payload = {
            "cart_item_id": 99999,
            "customer_id": test_customer
        }

        response = client.post(
            '/api/cart/remove',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # Should fail or return error message
        data = response.get_json()
        assert data['success'] is False

    def test_remove_missing_cart_item_id(self, client, test_customer):
        """Test removing without cart_item_id."""
        payload = {
            "customer_id": test_customer
        }

        response = client.post(
            '/api/cart/remove',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False


class TestCartIntegration:
    """Integration tests for complete cart workflows."""

    def test_add_view_remove_workflow(self, client, test_customer, test_vendor, test_product):
        """Test complete workflow: add -> view -> remove."""
        # Step 1: Add item
        add_payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 3,
            "selected_sugar": "normal",
            "selected_ice": "normal",
            "selected_size": "large"
        }

        add_response = client.post(
            '/api/cart/add',
            data=json.dumps(add_payload),
            content_type='application/json'
        )

        assert add_response.status_code == 200

        # Step 2: View cart
        view_payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor
        }

        view_response = client.post(
            '/api/cart/view',
            data=json.dumps(view_payload),
            content_type='application/json'
        )

        assert view_response.status_code == 200
        view_data = view_response.get_json()
        assert len(view_data['data']) == 1
        cart_item_id = view_data['data'][0]['cart_item_id']

        # Step 3: Remove item
        remove_payload = {
            "cart_item_id": cart_item_id,
            "customer_id": test_customer
        }

        remove_response = client.post(
            '/api/cart/remove',
            data=json.dumps(remove_payload),
            content_type='application/json'
        )

        assert remove_response.status_code == 200

        # Step 4: Verify cart is empty
        final_view = client.post(
            '/api/cart/view',
            data=json.dumps(view_payload),
            content_type='application/json'
        )

        final_data = final_view.get_json()
        assert final_data['total_amount'] == 0
