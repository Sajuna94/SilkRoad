"""
Pytest configuration and shared fixtures for API testing.

This module provides:
- Test database setup/teardown
- Flask test client
- Authentication helpers
- Common test data fixtures
"""

import pytest
import os
from src.app import app as flask_app
from src.config import db
from src.models import *
from werkzeug.security import generate_password_hash


@pytest.fixture(scope='session')
def app():
    """
    Create and configure a Flask application instance for testing.
    Uses a separate test database to avoid affecting production data.
    """
    # Override config for testing
    flask_app.config.update({
        'TESTING': True,
        'SQLALCHEMY_DATABASE_URI': os.getenv('TEST_DATABASE_URL', os.getenv('DATABASE_URL')),
        'WTF_CSRF_ENABLED': False,  # Disable CSRF for testing
        'SECRET_KEY': 'test-secret-key'
    })

    yield flask_app


@pytest.fixture(scope='session')
def _db(app):
    """
    Create test database and tables.
    This fixture has session scope to avoid recreating DB for every test.
    Tables are created once and reused across tests.
    Each test gets isolated via transaction rollback in the session fixture.
    """
    with app.app_context():
        db.create_all()
        yield db
        # Don't drop tables - they may have foreign key constraints
        # and each test already rolls back its changes
        # If you need to clean up, manually drop the test database


@pytest.fixture(scope='function')
def client(app):
    """
    Flask test client for making HTTP requests in tests.
    Note: We use a simpler approach - clean up test data using
    model-specific teardown in test classes if needed.
    """
    with app.app_context():
        yield app.test_client()
        # Clean up after test
        db.session.remove()


# ============================================================================
# Authentication Fixtures
# ============================================================================

@pytest.fixture(scope='function')
def vendor_manager(app):
    """Create a test vendor manager."""
    import uuid
    import random
    with app.app_context():
        # Use unique email and phone for each test to ensure isolation
        unique_id = str(uuid.uuid4())[:8]
        unique_email = f"manager-{unique_id}@test.com"
        unique_phone = f"09{random.randint(10000000, 99999999)}"
        manager = Vendor_Manager(
            name="Test Manager",
            email=unique_email,
            phone_number=unique_phone
        )
        db.session.add(manager)
        db.session.commit()
        manager_id = manager.id
        return manager_id


@pytest.fixture(scope='function')
def test_admin(app):
    """Create a test admin user. Returns admin ID."""
    import uuid
    import random
    with app.app_context():
        # Use unique email and phone for each test to ensure isolation
        unique_id = str(uuid.uuid4())[:8]
        unique_email = f"admin-{unique_id}@test.com"
        unique_phone = f"09{random.randint(10000000, 99999999)}"
        admin = Admin(
            name="Test Admin",
            email=unique_email,
            password=generate_password_hash("admin123"),
            phone_number=unique_phone,
            role="admin"
        )
        db.session.add(admin)
        db.session.commit()
        admin_id = admin.id
        return admin_id


@pytest.fixture(scope='function')
def test_vendor(app, vendor_manager):
    """Create a test vendor user. Returns vendor ID."""
    import uuid
    import random
    with app.app_context():
        # Use unique email, phone, and address for each test to ensure isolation
        unique_id = str(uuid.uuid4())[:8]
        unique_email = f"vendor-{unique_id}@test.com"
        unique_phone = f"09{random.randint(10000000, 99999999)}"
        unique_address = f"Test Vendor Address {unique_id}"
        vendor = Vendor(
            name="Test Vendor",
            email=unique_email,
            password=generate_password_hash("vendor123"),
            phone_number=unique_phone,
            address=unique_address,
            vendor_manager_id=vendor_manager,  # vendor_manager is now ID
            is_active=True,
            role="vendor"
        )
        db.session.add(vendor)
        db.session.commit()
        vendor_id = vendor.id
        return vendor_id


@pytest.fixture(scope='function')
def test_vendor2(app, vendor_manager):
    """Create a test vendor user. Returns vendor ID."""
    import uuid
    import random
    with app.app_context():
        # Use unique email, phone, and address for each test to ensure isolation
        unique_id = str(uuid.uuid4())[:8]
        unique_email = f"vendor-{unique_id}@test.com"
        unique_phone = f"09{random.randint(10000000, 99999999)}"
        unique_address = f"Test Vendor2 Address {unique_id}"
        vendor = Vendor(
            name="Test Vendor2",
            email=unique_email,
            password=generate_password_hash("vendor2123"),
            phone_number=unique_phone,
            address=unique_address,
            vendor_manager_id=vendor_manager,  # vendor_manager is now ID
            is_active=True,
            role="vendor"
        )
        db.session.add(vendor)
        db.session.commit()
        vendor_id = vendor.id
        return vendor_id


@pytest.fixture(scope='function')
def test_customer(app):
    """Create a test customer user. Returns customer ID."""
    import uuid
    import random
    with app.app_context():
        # Use unique email, phone, and address for each test to ensure isolation
        unique_id = str(uuid.uuid4())[:8]
        unique_email = f"customer-{unique_id}@test.com"
        unique_phone = f"09{random.randint(10000000, 99999999)}"
        unique_address = f"Customer Address {unique_id}"
        customer = Customer(
            name="Test Customer",
            email=unique_email,
            password=generate_password_hash("customer123"),
            phone_number=unique_phone,
            address=unique_address,
            role="customer"
        )
        db.session.add(customer)
        db.session.commit()
        customer_id = customer.id
        return customer_id


@pytest.fixture(scope='function')
def authenticated_client(client, test_customer):
    """
    Return a client with an authenticated session (as customer).
    test_customer is now an ID.
    """
    with client.session_transaction() as sess:
        sess['user_id'] = test_customer  # test_customer is ID
        sess['role'] = 'customer'
    return client


@pytest.fixture(scope='function')
def admin_client(client, test_admin):
    """Return a client authenticated as admin. test_admin is now an ID."""
    with client.session_transaction() as sess:
        sess['user_id'] = test_admin  # test_admin is ID
        sess['role'] = 'admin'
    return client


@pytest.fixture(scope='function')
def vendor_client(client, test_vendor):
    """Return a client authenticated as vendor. test_vendor is now an ID."""
    with client.session_transaction() as sess:
        sess['user_id'] = test_vendor  # test_vendor is ID
        sess['role'] = 'vendor'
    return client


# ============================================================================
# Helper Functions
# ============================================================================

@pytest.fixture
def register_payload():
    """Return a valid customer registration payload."""
    return {
        "role": "customer",
        "name": "New Customer",
        "email": "newcustomer@test.com",
        "password": "password123",
        "phone_number": "0933333333",
        "address": "New Address 789"
    }


@pytest.fixture
def login_payload():
    """Return a valid login payload."""
    return {
        "email": "customer@test.com",
        "password": "customer123"
    }


# ============================================================================
# Product Fixtures
# ============================================================================

@pytest.fixture(scope='function')
def test_product(app, test_vendor):
    """Create a test product. Returns product ID."""
    import uuid
    with app.app_context():
        # Use UUID to ensure unique image_url for each test
        unique_id = str(uuid.uuid4())[:8]
        product = Product(
            vendor_id=test_vendor,  # test_vendor is now ID
            name="Test Bubble Tea",
            price=50,
            description="Delicious test bubble tea",
            image_url=f"https://example.com/test-{unique_id}.jpg",
            is_listed=True
        )
        db.session.add(product)
        db.session.commit()
        product_id = product.id
        return product_id


@pytest.fixture(scope='function')
def test_product_2(app, test_vendor):
    """Create a second test product. Returns product ID."""
    import uuid
    with app.app_context():
        # Use UUID to ensure unique image_url for each test
        unique_id = str(uuid.uuid4())[:8]
        product = Product(
            vendor_id=test_vendor,  # test_vendor is now ID
            name="Test Milk Tea",
            price=45,
            description="Another delicious test tea",
            image_url=f"https://example.com/test2-{unique_id}.jpg",
            is_listed=True
        )
        db.session.add(product)
        db.session.commit()
        product_id = product.id
        return product_id
