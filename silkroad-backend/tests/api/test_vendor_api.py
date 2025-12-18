"""
API Tests for Vendor endpoints (/api/vendor/*).

Tests cover:
- Add products
- Update products
- Get vendor products
- Add discount policies
- View discount policies
"""

from copy import deepcopy, copy
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
            "is_listed": True,
            "sugar_options": "100%, 70%, 50%, 30%, 0%",
            "ice_options": "Hot, Warm, Cold, Iced",
            "size_options": "Small, Medium, Large"
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
        
        # test minimal fields
        del payload["is_listed"]
        del payload["image_url"]
        response = vendor_client.post(
            '/api/vendor/Add_Product',
            data=json.dumps(payload),
            content_type='application/json'
        )
        
        assert response.status_code == 201
        data = response.get_json()
        assert data['success'] is True
        assert 'id' in data["product"]
        
        
    def test_add_product_bad(self, vendor_client, test_vendor):
        """Test adding product with minimal required fields."""
        payload = {
            "vendor_id": test_vendor,  # test_vendor is now ID
            "name": "New Bubble Tea",
            "price": 55,
            "description": "Fresh and delicious",
            "image_url": "https://example.com/new.jpg",
            "is_listed": True,
            "sugar_options": "100%, 70%, 50%, 30%, 0%",
            "ice_options": "Hot, Warm, Cold, Iced",
            "size_options": "Small, Medium, Large"
        }
        
        def _helper(col : str):
            PL = copy(payload)
            del PL[col]
            response = vendor_client.post(
                '/api/vendor/Add_Product',
                data=json.dumps(PL),
                content_type='application/json'
            )
            assert response.status_code == 400
            return response
        
        rsp = _helper("vendor_id")
        assert rsp.get_json()['message'] == 'Missing required fields'
        
        rsp = _helper("name")
        assert rsp.get_json()['message'] == 'Missing required fields'
        
        rsp = _helper("price")
        assert rsp.get_json()['message'] == 'Missing required fields'
        
        rsp = _helper("description")
        assert rsp.get_json()['message'] == 'Missing required fields'
        
        rsp = _helper("sugar_options")
        assert rsp.get_json()['message'] == 'Missing required fields: options'
        
        rsp = _helper("ice_options")
        assert rsp.get_json()['message'] == 'Missing required fields: options'
        
        rsp = _helper("size_options")
        assert rsp.get_json()['message'] == 'Missing required fields: options'


class TestViewVendorProducts:
    """Test suite for getting vendor products."""

    def test_view_products_empty(self, client, test_vendor):
        """Test getting products when vendor has none."""
        response = client.get(f'/api/vendor/{test_vendor}/view_products')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert data['products'] == []

    def test_view_products_with_items(self, client, test_vendor, test_product, test_product_2):
        """Test getting products when vendor has items."""
        response = client.get(f'/api/vendor/{test_vendor}/view_products')

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True
        assert len(data['products']) >= 2

        # Verify product structure
        product = data['products'][0]
        assert 'id' in product
        assert 'name' in product
        assert 'price' in product
        assert 'image_url' in product
        assert 'is_listed' in product
 
    def test_view_products_nonexistent_vendor(self, client):
        """Test getting products for non-existent vendor."""
        response = client.get('/api/vendor/99999/view_products')

        assert response.status_code == 404
        data = response.get_json()
        assert data['success'] is False

    def test_view_product_detail_good(self, client, test_vendor, test_product):
        rsp = client.get(f'/api/vendor/{test_vendor}/view_product_detail/{test_product}')

        print(rsp.get_json()["message"])
        assert rsp.status_code == 200
        data = rsp.get_json()
        assert "name" in data["product"]
        assert "price" in data["product"]
        assert "image_url" in data["product"]
        assert "description" in data["product"]
        assert "sugar_option" in data["product"]
        assert "ice_option" in data["product"]
        assert "size_option" in data["product"]

    def test_view_product_detail_with_invaild_vendor_and_product(self, client, test_vendor, test_product):
        """test with a invalid vendot_id"""
        rsp = client.get(f'/api/vendor/{test_vendor + 1}/view_product_detail/{test_product}')
        
        assert rsp.status_code == 404
        data = rsp.get_json()
        assert data["message"] == "Vendor not found"



        rsp = client.get(f'/api/vendor/{test_vendor}/view_product_detail/{test_product+1}')
        
        assert rsp.status_code == 404
        assert rsp.get_json()["message"] == "Product not found"


class TestUpdateProducts:
    """Test suite for updating products."""

    def test_update_good(self, vendor_client, test_product):
        """Test updating single product with any mutable attribute."""
        
        def _helper(col_name : str, value : str):
            payload = [
                {
                    "product_id": test_product,
                    "behavior": {
                        "col_name": col_name,
                        "value": value
                    }
                }
            ]
            response = vendor_client.patch(
                '/api/vendor/update_products',
                data=json.dumps(payload),
                content_type='application/json'
            )
            assert response.status_code == 200
            return response.get_json() 
        
        rsp = _helper('name', 'Updated Tea Name')
        assert rsp['products'][0]['name'] == "Updated Tea Name"
        
        rsp = _helper('description', 'Updated Tea Description')
        assert rsp['products'][0]['description'] == "Updated Tea Description"
        
        rsp = _helper('price', '60')
        assert rsp['products'][0]['price'] == 60
        
        rsp = _helper("image_url", "https://example.com/image.jpg")
        assert rsp['products'][0]['image_url'] == "https://example.com/image.jpg"
        
        rsp = _helper("is_listed", "false")
        assert not rsp['products'][0]['is_listed']
        
        rsp = _helper("is_listed", "true")
        assert rsp['products'][0]['is_listed']
        
        rsp = _helper("sugar_options", "10%, 0%")
        assert rsp['products'][0]['sugar_options'] == ["10%", "0%"]
        
        rsp = _helper("ice_options", "10%, 0%, 50%")
        assert rsp['products'][0]['ice_options'] == ["10%", "0%", "50%"]
        
        rsp = _helper("size_options", "10%, 0%, 50%, 20%")
        assert rsp['products'][0]['size_options'] == ["10%", "0%", "50%", "20%"]
        
        
        """mutable_column"""
        payload = [
            {
                "product_id": test_product,
                "behavior": {
                    "col_name": "name",
                    "value": "new name"
                }
            },
            {
                "product_id": test_product,
                "behavior": {
                    "col_name": "description",
                    "value": "new description"
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
        assert data['products'][0]["name"] == "new name"
        assert data['products'][1]["description"] == "new description"
        
        
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
        
        data = response.get_json()
        assert response.status_code == 201
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
        
    def test_add_discount_with_invalid_data(self, vendor_client, test_vendor):
        
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
        
        def call(key, value):
            
            PL = deepcopy(payload)
            PL[key] = value
            response = vendor_client.post(
                '/api/vendor/add_discount',
                data=json.dumps(PL),
                content_type='application/json'
            )
            assert response.status_code == 400
            return response.get_json()
        
        #start incorrect "type"
        data = call("type", "good")
        assert "type" in data["message"]
        #end incorrect "type"
        
        
        #start incorrect "value" with "type" == "percent"
        data = call("value", 100)
        assert "less" in data["message"]
        
        data = call("value", 101)
        assert "less" in data["message"]
        
        data = call("value", -1)
        assert "greater" in data["message"]
        #end incorrect "value" with "type" == "percent"

        
        #start incorrect "value" with "type" == "fixed"
        payload["type"] = "fixed"
        
        data = call("value", -1)
        assert "greater" in data["message"]
        
        data = call("min_purchase", -1)
        assert "greater" in data["message"]
        
        data = call("min_purchase", 5)
        assert "greater" in data["message"]
        
        payload["type"] = "percent" #fix to origin
        #end incorrect "value" with "type" == "fixed"
        
        #start with incorrect "min_purchase"
        payload["type"] = "fixed"
        
        #min_pirchase must greater than or equal to 0
        data = call("min_purchase", 0)
        assert "greater" in data["message"]
        data = call("min_purchase", -1)
        assert "greater" in data["message"]
        
        #min_purchase must be greater than value
        data = call("min_purchase", 10)
        assert "greater" in data["message"]
        data = call("min_purchase", 9)
        assert "greater" in data["message"]
        
        payload["type"] = "percent" #fix to origin
        #end with incorrect value and min_purchase
        
        

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
                is_available=True,
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
            "is_listed": True,
            "sugar_options": "100%, 70%, 50%, 30%, 0%",
            "ice_options": "Hot, Warm, Cold, Iced",
            "size_options": "Small, Medium, Large"
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
        list_response = vendor_client.get(f'/api/vendor/{test_vendor}/view_products')

        assert list_response.status_code == 200
        products = list_response.get_json()['products']
        assert any(p['id'] == product_id for p in products)
