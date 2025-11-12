# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SilkRoad Backend is a Flask-based e-commerce backend using SQLAlchemy ORM with MySQL database. The project uses a schema-based database architecture with separate schemas for authentication (`auth`) and application data.

## Development Commands

### Environment Setup

**Using uv (recommended):**
```bash
uv sync
uv run src/app.py
```

**Using pip:**
```bash
# Linux/Mac
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

# Windows
python -m venv .venv
.venv\Scripts\activate
pip install -e .
```

### Running the Server

```bash
# With uv
uv run src/app.py

# With python
python3 src/app.py

# With Flask CLI (Windows PowerShell)
flask run
```

The server runs on `http://localhost:5000` in debug mode by default.

### Testing

```bash
# Run all tests
pytest

# Run specific test file
pytest tests/unit/test_models.py

# Run with verbose output
pytest -v
```

The test suite includes model schema validation that checks ORM models against actual database schema.

## Architecture

### Directory Structure

- `src/app.py` - Flask application entry point with CORS configuration
- `src/config/` - Database configuration and initialization
- `src/models/` - SQLAlchemy ORM models (18 models total)
- `src/routes/` - Flask Blueprint route definitions
- `src/controllers/` - Business logic for handling API requests
- `src/middlewares/` - Middleware functions (currently unused)
- `src/utils/` - Utility functions
- `src/test/` - Legacy API testing (see `tests/` for actual test suite)
- `tests/unit/` - Unit tests for models and functionality

### Database Architecture

**Multi-Schema Design:**
- `auth` schema: Authentication-related tables (users, vendors, customers, admins, vendor_managers)
- Application schema: Business logic tables (products, orders, carts, reviews, etc.)

**Key Model Relationships:**
- `User` is the base class with specialized subclasses:
  - `Customer(User)` - Regular customers
  - `Vendor(User)` - Shop owners
  - `Admin(User)` - System administrators
  - `Vender_Mananger` - Vendor account managers
- All models use `__table_args__ = {"schema": "auth"}` or similar to specify schema

**Database Configuration:**
- Connection URL is stored in `.env` as `DATABASE_URL`
- Format: `mysql://<username>:<password>@<host>:<port>/<db_name>`
- Uses PyMySQL as MySQL driver (installed as MySQLdb)
- Database must be created manually before running the application

### Application Flow

1. **Routes** (Blueprint definitions) → 2. **Controllers** (business logic) → 3. **Models** (database operations)

Routes are defined using Flask Blueprints and registered with the main app. Each route delegates to a controller function that handles the business logic and database interactions.

### Model Definitions

All models are exported from `src/models/__init__.py` and include:
- Admin, Block_Record, Cart_Item, Cart, Customer, Discount_Policy
- Order_Item, Order, Product, Review, System_Announcement
- User, Vender_Mananger, Vendor

Each model:
- Inherits from `db.Model`
- Specifies `__tablename__` and `__table_args__` (for schema)
- Defines columns with appropriate constraints
- May include helper methods (e.g., `User.check_password()`)

### CORS Configuration

The app allows CORS requests from:
- `https://sajuna94.github.io`
- `http://localhost:5173`

## Important Implementation Notes

### Database Initialization

The database initialization is currently commented out in `src/app.py`:
```python
# init_db(app)  # Uncommented when ready to use
```

To enable database operations:
1. Create the database in MySQL
2. Add `DATABASE_URL` to `.env` file
3. Uncomment `init_db(app)` in `src/app.py`
4. Uncomment route registrations as needed

### Route Registration

Routes are currently commented out in `src/app.py`. To activate:
```python
from routes import user_routes, cart_routes, shop_routes

app.register_blueprint(user_routes, url_prefix='/api/user')
app.register_blueprint(cart_routes, url_prefix='/api/cart')
app.register_blueprint(shop_routes, url_prefix='/api/shop')
```

### Password Security

User passwords are hashed using Werkzeug's `generate_password_hash()` and verified with `check_password_hash()`. Never store plain text passwords.

### Model Schema Testing

The `tests/unit/test_models.py` file validates that ORM models match the actual database schema:
- Checks table existence
- Validates column types (with flexible type matching)
- Verifies nullable constraints
- Compares ORM definitions with database inspector results

## File Organization Conventions

- Each package directory contains `__init__.py` with exports and documentation
- Models use relative imports: `from ..config.database import db`
- Controllers are imported into routes: `from controllers import register_user, login_user`
- All exports are explicitly listed in `__all__` to avoid wildcard import issues

## Environment Variables

Required in `.env` file:
- `DATABASE_URL` - MySQL connection string

**Never commit `.env` to version control.**

## Python Version

This project requires Python 3.13 or higher (specified in `.python-version` and `pyproject.toml`).
