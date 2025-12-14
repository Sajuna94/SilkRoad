"""
Cleanup script for test data.

This script calls the /api/test/Clear endpoint to clean up test data.
Make sure the Flask server is running before executing this script.

Usage:
    # Method 1: Call the API (requires server running)
    python tests/cleanup_test_data.py

    # Method 2: Use curl directly (requires server running)
    curl http://localhost:5000/api/test/Clear

    # Method 3: Import and call the function directly (no server needed)
    python tests/cleanup_test_data.py --direct
"""

import sys
import os
import argparse

# broken
def cleanup_via_api():
    """Call the /api/test/Clear endpoint to clean up data."""
    import requests

    print("\n🧹 Calling cleanup API...")
    print("=" * 50)

    try:
        # Call the Clear endpoint
        response = requests.get('http://localhost:5000/api/test/Clear')

        if response.status_code == 200:
            data = response.json()
            print(f"✅ {data.get('message', 'Cleanup successful')}")
            print("=" * 50)
            print()
            return True
        else:
            print(f"❌ Error: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Error: Could not connect to server")
        print("Please make sure the Flask server is running:")
        print("  uv run src/app.py")
        print("\nOr use --direct flag to clean without server:")
        print("  python tests/cleanup_test_data.py --direct")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def cleanup_direct():
    """Import and call the cleanup function directly without running server."""
    # Add src to path
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    src_path = os.path.join(project_root, 'src')
    sys.path.insert(0, project_root)
    sys.path.insert(0, src_path)

    print("\n🧹 Running direct cleanup...")
    print("=" * 50)

    try:
        from flask import Flask
        from dotenv import load_dotenv
        from config.database import db
        from models import (
            User, Customer, Vendor, Admin, Vendor_Manager,
            Product, Cart, Cart_Item, Order, Order_Item,
            Discount_Policy, Review, System_Announcement, Block_Record,
            Sugar_Option, Ice_Option, Sizes_Option
        )

        # Load environment variables
        load_dotenv()

        # Create Flask app
        app = Flask(__name__)
        app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
        app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        db.init_app(app)

        with app.app_context():
            # Delete child records before parent records to avoid foreign key violations
            db.session.query(Order_Item).delete()
            db.session.query(Order).delete()
            db.session.query(Cart_Item).delete()
            db.session.query(Cart).delete()
            db.session.query(Review).delete()
            db.session.query(Discount_Policy).delete()  # Must be before Vendor
            db.session.query(Sugar_Option).delete() # Must be before Product
            db.session.query(Ice_Option).delete() # Must be before Product
            db.session.query(Sizes_Option).delete() # Must be before Product
            db.session.query(Product).delete()  # Must be before Vendor
            db.session.query(Block_Record).delete()
            db.session.query(System_Announcement).delete()
            db.session.query(Vendor).delete()  # After all vendor-related tables
            db.session.query(Customer).delete()
            db.session.query(Admin).delete()
            db.session.query(User).delete()
            db.session.query(Vendor_Manager).delete()
            db.session.commit()

            print("✅ All test data cleared successfully")
            print("=" * 50)
            print()
            return True

    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Clean up test data')
    parser.add_argument(
        '--direct',
        action='store_true',
        help='Clean directly without calling API (no server needed)'
    )

    args = parser.parse_args()

    if args.direct:
        success = cleanup_direct()
    else:
        success = cleanup_via_api()

    sys.exit(0 if success else 1)
