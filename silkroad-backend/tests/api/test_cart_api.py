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


class TestAddToCartWithoutLogin:
    """Test suite for add to cart endpoint."""

    def test_add_to_cart_success(self, client, test_customer, test_vendor, test_product):
        """Test successfully adding a product to cart."""
        payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 2,
            "selected_sugar": "50%",
            "selected_ice": "70%",
            "selected_size": "M"
        }

        response = client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        
        with client.session_transaction() as sess:
            cart = sess["cart"]
            item = cart["items"][0]
            
            assert cart["vendor_id"] == test_vendor
            assert item["product_id"] ==  test_product
            assert item["quantity"] == 2
            assert item["selected_sugar"] == "50%"
            assert item["selected_ice"] == "70%"
            assert item["selected_size"] == "M"

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
        
        with client.session_transaction() as sess:
            assert "cart" not in sess

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
        
        with client.session_transaction() as sess:
            assert "cart" not in sess

    def test_add_multiple_items_same_vendor(self, client, test_customer, test_vendor, test_product, test_product_2):
        """Test adding multiple items from same vendor."""
        # Add first product
        payload1 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1,
            "selected_sugar": "50%",
            "selected_ice": "50%",
            "selected_size": "M"
        }

        response1 = client.post(
            '/api/cart/add',
            data=json.dumps(payload1),
            content_type='application/json'
        )

        assert response1.status_code == 200
        
        with client.session_transaction() as sess:
            cart = sess["cart"]
            item = cart["items"][0]
            
            assert cart["vendor_id"] == test_vendor
            assert item["product_id"] ==  test_product
            assert item["quantity"] == 1
            assert item["selected_sugar"] == "50%"
            assert item["selected_ice"] == "50%"
            assert item["selected_size"] == "M"

        # Add second product
        payload2 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product_2,
            "quantity": 2,
            "selected_sugar": "30%",
            "selected_ice": "30%",
            "selected_size": "M"
        }

        response2 = client.post(
            '/api/cart/add',
            data=json.dumps(payload2),
            content_type='application/json'
        )

        assert response2.status_code == 200
        data2 = response2.get_json()
        assert data2['success'] is True
        
        with client.session_transaction() as sess:
            cart = sess["cart"]
            item = cart["items"][1]
            
            assert cart["vendor_id"] == test_vendor
            assert item["product_id"] ==  test_product_2
            assert item["quantity"] == 2
            assert item["selected_sugar"] == "30%"
            assert item["selected_ice"] == "30%"
            assert item["selected_size"] == "M"
            
    def test_add_multiple_items_different_vendor(self, client, 
        test_vendor, test_vendor2, test_product, test_product_2):
        payload1 = {
            # "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1,
            "selected_sugar": "50%",
            "selected_ice": "50%",
            "selected_size": "M"
        }

        response1 = client.post(
            '/api/cart/add',
            data=json.dumps(payload1),
            content_type='application/json'
        )

        assert response1.status_code == 200
        
        with client.session_transaction() as sess:
            cart = sess["cart"]
            item = cart["items"][0]
            
            assert cart["vendor_id"] == test_vendor
            assert item["product_id"] ==  test_product
            assert item["quantity"] == 1
            assert item["selected_sugar"] == "50%"
            assert item["selected_ice"] == "50%"
            assert item["selected_size"] == "M"
            
        payload2 = {
            # "customer_id": test_customer,
            "vendor_id": test_vendor2,
            "product_id": test_product_2,
            "quantity": 2,
            "selected_sugar": "30%",
            "selected_ice": "30%",
            "selected_size": "M"
        }

        response2 = client.post(
            '/api/cart/add',
            data=json.dumps(payload2),
            content_type='application/json'
        )

        assert response2.status_code == 200
        data2 = response2.get_json()
        assert data2['success'] is True
        
        with client.session_transaction() as sess:
            cart = sess["cart"]
            item = cart["items"][0]
            
            assert cart["vendor_id"] == test_vendor2
            assert item["product_id"] ==  test_product_2
            assert item["quantity"] == 2
            assert item["selected_sugar"] == "30%"
            assert item["selected_ice"] == "30%"
            assert item["selected_size"] == "M"

        
class TestAddToCartWithLogin:
    """Test suite for add to cart endpoint with authenticated users."""

    def test_add_to_cart_success(self, authenticated_client, test_customer, test_vendor, test_product):
        """Test successfully adding a product to cart when logged in."""
        
        payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 2,
            "selected_sugar": "50%",
            "selected_ice": "70%",
            "selected_size": "M"
        }

        response = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_add_to_cart_missing_customer_id(self, authenticated_client, test_vendor, test_product):
        """Test adding to cart fails without customer_id when logged in."""
        
        payload = {
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1
        }

        response = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        

    def test_add_to_cart_missing_vendor_id(self, authenticated_client, test_customer, test_product):
        """Test adding to cart fails without vendor_id when logged in."""
        
        payload = {
            "customer_id": test_customer,
            "product_id": test_product,
            "quantity": 1
        }

        response = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        

    def test_add_multiple_items_same_vendor(self, authenticated_client, test_customer, test_vendor, test_product, test_product_2):
        """Test adding multiple items from same vendor when logged in."""        
        # Add first product
        payload1 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1,
            "selected_sugar": "50%",
            "selected_ice": "50%",
            "selected_size": "M"
        }

        response1 = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload1),
            content_type='application/json'
        )

        assert response1.status_code == 200
        data = response1.get_json()
        assert data['success'] is True
        
        # Add second product
        payload2 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product_2,
            "quantity": 2,
            "selected_sugar": "30%",
            "selected_ice": "30%",
            "selected_size": "M"
        }

        response2 = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload2),
            content_type='application/json'
        )

        assert response2.status_code == 200
        data2 = response2.get_json()
        assert data2['success'] is True
        
            
    def test_add_multiple_items_different_vendor(self, authenticated_client, test_customer,
        test_vendor, test_vendor2, test_product, test_product_2):
        """Test adding items from different vendors when logged in (should replace cart)."""
        
        payload1 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor,
            "product_id": test_product,
            "quantity": 1,
            "selected_sugar": "50%",
            "selected_ice": "50%",
            "selected_size": "M"
        }

        response1 = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload1),
            content_type='application/json'
        )

        assert response1.status_code == 200
            
        payload2 = {
            "customer_id": test_customer,
            "vendor_id": test_vendor2,
            "product_id": test_product_2,
            "quantity": 2,
            "selected_sugar": "30%",
            "selected_ice": "30%",
            "selected_size": "M"
        }

        response2 = authenticated_client.post(
            '/api/cart/add',
            data=json.dumps(payload2),
            content_type='application/json'
        )

        assert response2.status_code == 200
        data2 = response2.get_json()
        assert data2['success'] is True
            

class TestViewCart:
    """Test suite for view cart endpoint."""

    def test_view_empty_cart(self, client, authenticated_client, test_customer, test_vendor):
        """Test viewing an empty cart."""
        """Without login"""
        response = client.get(
            f'/api/cart/view/{test_customer}',
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data'] == []
        assert data['total_amount'] == 0
        assert 'empty' in data['message'].lower()
        
        """With login"""
        response = authenticated_client.get(
            f'/api/cart/view/{test_customer}',
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['data'] == []
        assert data['total_amount'] == 0
        assert 'empty' in data['message'].lower()
        
        

    def test_view_cart_with_items(self, client, authenticated_client, test_customer, test_vendor, test_product):
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

        """Without login"""
        view_payload = {
            "customer_id": test_customer,
            "vendor_id": test_vendor
        }

        response = client.get(
            f'/api/cart/view/{test_customer}',
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
        
        """With login"""
        response = authenticated_client.get(
            f'/api/cart/view/{test_customer}',
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
        
        
    def test_view_cart_with_invalid_customer_id(self, authenticated_client, test_customer):
        response = authenticated_client.get(
            f'/api/cart/view/{test_customer + 1}',
            content_type='application/json'
        )
        
        assert response.status_code == 404
        

    
class TestRemoveFromCart:
    """Test suite for remove from cart endpoint."""

    def test_remove_from_cart_success(self, authenticated_client, test_customer, test_vendor, test_product):
        """Test successfully removing an item from cart."""
        # First add an item
        from models import Cart, Cart_Item
        from config import db

        cart = Cart(customer_id=test_customer, vendor_id=test_vendor)
        db.session.add(cart)
        db.session.commit()

        cart_item = Cart_Item(
            cart_id=cart.customer_id,
            product_id=test_product,
            quantity=2,
            selected_sugar="50%",
            selected_ice="50%",
            selected_size="M"
        )
        db.session.add(cart_item)
        db.session.commit()

        # Now remove it
        payload = {
            "cart_item_id": cart_item.id,
            "customer_id": test_customer
        }

        response = authenticated_client.post(
            '/api/cart/remove',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_remove_nonexistent_item(self, authenticated_client, test_customer):
        """Test removing non-existent cart item."""
        payload = {
            "cart_item_id": 99999,
            "customer_id": test_customer
        }

        response = authenticated_client.post(
            '/api/cart/remove',
            data=json.dumps(payload),
            content_type='application/json'
        )

        # Should fail or return error message
        data = response.get_json()
        assert data['success'] is False
        assert data['message'] == 'cart_item_id not found'

    def test_remove_missing_cart_item_id(self, authenticated_client, test_customer):
        """Test removing without cart_item_id."""
        payload = {
            "customer_id": test_customer
        }

        response = authenticated_client.post(
            '/api/cart/remove',
            data=json.dumps(payload),
            content_type='application/json'
        )

        assert response.status_code == 400
        data = response.get_json()
        assert data['success'] is False
        assert data['message'] == 'loss cart_item_id'


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

        view_response = client.get(
            f'/api/cart/view/{test_customer}',
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
        final_view = client.get(
            f'/api/cart/view/{test_customer}',
            content_type='application/json'
        )

        final_data = final_view.get_json()
        assert final_view.status_code == 200
        assert final_data["success"] == True
        assert final_data['total_amount'] == 0
        assert final_data["data"] == []
