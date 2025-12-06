# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Environment Setup
```bash
# Install dependencies with uv (recommended)
uv sync

# Or with pip
python3 -m venv .venv
source .venv/bin/activate  # Unix
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
pip install -e .
```

### Running the Server
```bash
# With uv
uv run src/app.py

# With python
python3 src/app.py
```

### Testing
```bash
# Run all tests
pytest

# Run all tests with verbose output
pytest -v

# Run specific test file
pytest tests/api/test_user_api.py

# Run specific test class
pytest tests/api/test_user_api.py::TestUserRegistration

# Run specific test
pytest tests/api/test_user_api.py::TestUserRegistration::test_register_customer_success

# Run tests with coverage report
pytest --cov=src --cov-report=html

# Run tests matching a pattern
pytest -k "test_login"

# Run tests in parallel (requires pytest-xdist)
pytest -n auto
```

### Database Setup
1. Create a MySQL database first
2. Create `.env` file with: `DATABASE_URL=mysql://<username>:<password>@<host>:<port>/<db_name>`
3. Tables are auto-created via SQLAlchemy on app startup (`db.create_all()`)
4. Reference SQL schema available in `sql/main.sql`

## Architecture Overview

### Three-Layer MVC Structure

**Routes Layer** (`src/routes/`)
- Defines API endpoints using Flask Blueprints
- Each route file documents expected request/response formats in docstrings
- Routes delegate to controllers for business logic
- Blueprint prefixes: `/api/user`, `/api/cart`, `/api/order`, `/api/admin`, `/api/vendor`, `/api/test`

**Controllers Layer** (`src/controllers/`)
- Handles business logic and request/response processing
- Interacts with models to perform database operations
- Returns JSON responses with `{"message": str, "success": bool, "data": dict}` format

**Models Layer** (`src/models/`)
- SQLAlchemy ORM models organized by domain:
  - `models/auth/`: User hierarchy (User, Admin, Customer, Vendor, Vendor_Manager), Block_Record, System_Announcement
  - `models/order/`: Cart, Cart_Item, Order, Order_Item, Discount_Policy
  - `models/store/`: Product, Review, option models (ice, sugar, sizes)
- Models exported via `models/__init__.py` for clean imports

### User Model Polymorphism
The `User` model uses SQLAlchemy's polymorphic inheritance:
- Base class: `User` (in `auth` schema, `users` table)
- Polymorphic on `role` column
- Subclasses: `Admin`, `Customer`, `Vendor`
- Each has a shared `register()` classmethod with duplicate checks
- Password hashing via werkzeug: `set_password()` and `check_password()`

### Session-Based Authentication
- Session management in `src/utils/login_verify.py`
- `@require_login(role)` decorator validates session and role
- Session keys: `user_id`, `role`
- Returns 401 if not logged in, 403 if insufficient permissions

### Database Configuration
- Single `db` instance in `config/database.py`
- PyMySQL adapter for MySQL (`pymysql.install_as_MySQLdb()`)
- Database URL from environment variable
- Auto-initialization with `init_db(app)` in `src/app.py`

### API Route Registration
All routes registered in `src/app.py`:
```python
app.register_blueprint(user_routes, url_prefix='/api/user')
app.register_blueprint(cart_routes, url_prefix='/api/cart')
app.register_blueprint(admin_routes, url_prefix='/api/admin')
app.register_blueprint(order_routes, url_prefix='/api/order')
app.register_blueprint(vendor_routes, url_prefix='/api/vendor')
app.register_blueprint(test_routes, url_prefix='/api/test')
```

### CORS Configuration
CORS enabled for:
- `https://sajuna94.github.io`
- `http://localhost:5173` (dev frontend)
- `http://localhost:5000` (API)

## Key Patterns

### Model Registration Pattern
Models use classmethod `register()` for creating new instances:
- Validates email/phone uniqueness at User level
- Hashes passwords automatically
- Returns uncommitted instance (caller must `db.session.add()` and `commit()`)
- Subclasses pass additional fields via `**kwargs`

### Response Format
All API responses follow:
```python
{
    "message": str,
    "success": bool,
    "data": dict  # optional, contains returned data
}
```

### Schema Organization
Database uses schemas to organize tables:
- `auth` schema: all user-related tables
- Other models use default schema

## Important Files

- `src/app.py`: Flask app initialization, route registration, startup logic
- `src/config/database.py`: Database connection and initialization
- `src/utils/login_verify.py`: Session authentication decorator
- `src/models/auth/user.py`: Base User model with polymorphic inheritance
- `sql/main.sql`: Database schema reference
- `.env`: Database URL and session key (not in git)

## Testing Strategy

### Test Organization
Tests are organized into two categories:

**Unit Tests** (`tests/unit/`)
- `test_models.py`: Database schema validation tests
- Validates ORM models match actual database schema
- Checks column types, constraints, and relationships

**API Integration Tests** (`tests/api/`)
- `test_user_api.py`: User registration, login, profile management
- `test_cart_api.py`: Shopping cart operations (add, view, remove)
- `test_vendor_api.py`: Product and discount policy management

### Test Fixtures
Common fixtures are defined in `tests/conftest.py`:

**Database Fixtures:**
- `app`: Configured Flask app for testing
- `_db`: Test database with auto-created tables
- `session`: Database session with automatic rollback after each test

**User Fixtures:**
- `test_admin`: Pre-created admin user
- `test_vendor`: Pre-created vendor with manager
- `test_customer`: Pre-created customer
- `vendor_manager`: Pre-created vendor manager

**Authenticated Client Fixtures:**
- `authenticated_client`: Client with customer session
- `admin_client`: Client with admin session
- `vendor_client`: Client with vendor session

**Product Fixtures:**
- `test_product`: Sample product from test vendor
- `test_product_2`: Second sample product

### Test Database Setup
- Tests use `TEST_DATABASE_URL` from environment, falls back to `DATABASE_URL`
- Each test gets a fresh database session with automatic rollback
- No need to manually clean up data between tests
- Can optionally create a separate test database to avoid affecting dev data

### Writing New Tests
When adding new API endpoints:

1. **Create test file** in `tests/api/` following naming convention `test_{endpoint}_api.py`
2. **Organize by endpoint** using test classes (e.g., `TestUserLogin`, `TestAddToCart`)
3. **Test success cases** first, then edge cases and failures
4. **Use fixtures** from `conftest.py` for test data
5. **Verify response structure** including status codes and JSON format
6. **Test authentication** using authenticated client fixtures when needed

Example test structure:
```python
class TestNewEndpoint:
    def test_success_case(self, client, test_user):
        """Test the happy path."""
        payload = {"field": "value"}
        response = client.post('/api/endpoint', json=payload)

        assert response.status_code == 200
        data = response.get_json()
        assert data['success'] is True

    def test_missing_field(self, client):
        """Test validation fails with missing required field."""
        payload = {}
        response = client.post('/api/endpoint', json=payload)

        assert response.status_code == 400
        assert response.get_json()['success'] is False
```

### Manual Testing
For quick manual testing during development:
- Use `/api/test/*` endpoints (defined in `src/utils/test.py`)
- `/api/test/init_manager`: Create test vendor manager
- `/api/test/init_users`: Create test admin, vendor, customer
- `/api/test/Clear`: Clear all test data

## Development Notes

- Route files contain detailed API documentation in docstrings
- Use `route_info_printer(True)` to debug registered routes at startup
- Models must be imported in `models/__init__.py` to be created by `db.create_all()`
- SQLAlchemy column types and options documented in `src/models/Note.md`
- Project uses Python 3.13
- **Always run tests before committing** to ensure changes don't break existing functionality
