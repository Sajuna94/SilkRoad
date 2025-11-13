"""
Model Schema Validation Tests

This module validates that SQLAlchemy ORM models match the actual database schema.
It performs bidirectional checks to ensure consistency between code and database.
"""

import pytest
from src.app import app
from src.config import db
from src.models import *
from sqlalchemy import inspect
from sqlalchemy.exc import OperationalError

WARNING = '\033[93m'
FAILED = '\033[91m'
RESET = '\033[0m'

def types_compatible(orm_type, db_type):
    """
    Check if ORM and database column types are compatible.

    Handles common type variations between SQLAlchemy and MySQL:
    - datetime/timestamp equivalence
    - boolean/tinyint equivalence
    - enum/varchar flexibility

    Args:
        orm_type: SQLAlchemy column type
        db_type: MySQL column type

    Returns:
        bool: True if types are compatible
    """
    orm = str(orm_type).lower()
    db = str(db_type).lower()

    # Handle common type equivalences
    if orm in ['datetime', 'timestamp'] and db in ['datetime', 'timestamp']:
        return True
    if orm == 'boolean' and 'tinyint' in db:
        return True
    if 'enum' in orm and 'varchar' in db:
        return True
    if 'varchar' in orm and 'enum' in db:
        return True

    return orm in db or db in orm


def check_database_connection():
    """
    Verify database connection is available.

    Returns:
        bool: True if database is accessible
    """
    try:
        with app.app_context():
            db.engine.connect()
        return True
    except OperationalError:
        return False


@pytest.mark.skipif(not check_database_connection(), reason="Database not available")
def test_model_schema_validation():
    """
    Comprehensive schema validation test.

    Validates:
    1. All ORM-defined tables exist in database
    2. All ORM columns exist with correct types and constraints
    3. All database columns are reflected in ORM (warns if missing)
    4. Primary key definitions match
    5. Nullable constraints match
    """
    with app.app_context():
        inspector = inspect(db.engine)
        errors = []
        warnings = []

        for full_table_name, table in db.metadata.tables.items():
            print(f"\n{'='*60}")
            print(f"Validating Table: {full_table_name}")
            print(f"{'='*60}")

            # Parse schema and table name
            if '.' in full_table_name:
                schema, table_name = full_table_name.split('.', 1)
            else:
                schema = None
                table_name = full_table_name

            # Check 1: Table exists in database
            if not inspector.has_table(table_name, schema=schema):
                error_msg = f"Table '{full_table_name}' defined in ORM but does not exist in database"
                errors.append(error_msg)
                print(f"{FAILED} FAILED: {error_msg} {RESET}")
                continue

            print(f"✅ Table exists in database")

            # Get columns from both sources
            db_cols = {c['name']: c for c in inspector.get_columns(table_name, schema=schema)}
            orm_cols = {c.name: c for c in table.columns}

            # Check 2: ORM columns exist in database with correct properties
            print(f"\nValidating ORM → Database columns:")
            for col_name, orm_col in orm_cols.items():
                if col_name not in db_cols:
                    error_msg = f"Column '{full_table_name}.{col_name}' defined in ORM but missing in database"
                    errors.append(error_msg)
                    print(f"  {FAILED} {col_name}: {error_msg} {RESET}")
                    continue

                db_col = db_cols[col_name]

                # Validate type compatibility
                if not types_compatible(orm_col.type, db_col['type']):
                    error_msg = f"Type mismatch in '{full_table_name}.{col_name}': ORM={orm_col.type}, DB={db_col['type']}"
                    errors.append(error_msg)
                    print(f"  {FAILED} {col_name}: {error_msg} {RESET}")
                    continue

                # Validate nullable constraint
                if orm_col.nullable != db_col['nullable']:
                    error_msg = f"Nullable mismatch in '{full_table_name}.{col_name}': ORM nullable={orm_col.nullable}, DB nullable={db_col['nullable']}"
                    errors.append(error_msg)
                    print(f"  {FAILED} {col_name}: {error_msg} {RESET}")
                    continue

                print(f"  ✅ {col_name}: type={db_col['type']}, nullable={db_col['nullable']}")

            # Check 3: Database columns are reflected in ORM (bidirectional check)
            print(f"\nValidating Database → ORM columns:")
            extra_db_cols = set(db_cols.keys()) - set(orm_cols.keys())
            if extra_db_cols:
                for col_name in extra_db_cols:
                    warning_msg = f"Column '{full_table_name}.{col_name}' exists in database but not in ORM model"
                    warnings.append(warning_msg)
                    print(f"  {WARNING}  {col_name}: Missing in ORM model {RESET}")
            else:
                print(f"  ✅ All database columns are reflected in ORM")

            # Check 4: Primary key validation
            print(f"\nValidating Primary Keys:")
            try:
                pk_constraint = inspector.get_pk_constraint(table_name, schema=schema)
                db_pk_cols = set(pk_constraint.get('constrained_columns', []))
                orm_pk_cols = {c.name for c in table.primary_key.columns}

                if db_pk_cols != orm_pk_cols:
                    error_msg = f"Primary key mismatch in '{full_table_name}': ORM={orm_pk_cols}, DB={db_pk_cols}"
                    errors.append(error_msg)
                    print(f"  {FAILED} {error_msg} {RESET}")
                else:
                    print(f"  ✅ Primary keys match: {orm_pk_cols}")
            except Exception as e:
                warning_msg = f"Could not validate primary keys for '{full_table_name}': {str(e)}"
                warnings.append(warning_msg)
                print(f"  {WARNING}  {warning_msg} {RESET}")

        # Print summary
        print(f"\n{'='*60}")
        print(f"VALIDATION SUMMARY")
        print(f"{'='*60}")
        print(f"Tables validated: {len(db.metadata.tables)}")
        print(f"Errors found: {len(errors)}")
        print(f"Warnings: {len(warnings)}")

        if warnings:
            print(f"\n{WARNING}  WARNINGS:")
            for warning in warnings:
                print(f"  - {warning}")
            print(f"{RESET}")
        if errors:
            print(f"\n{FAILED} ERRORS:")
            for error in errors:
                print(f"  - {error}")
            print(f"{RESET}")
            pytest.fail(f"Schema validation failed with {len(errors)} error(s). See output above for details.")
        else:
            print(f"\n✅ All schema validations passed!")


@pytest.mark.skipif(not check_database_connection(), reason="Database not available")
def test_all_models_registered():
    """
    Verify all model classes are properly registered with SQLAlchemy metadata.
    """
    with app.app_context():
        # Expected minimum number of models based on CLAUDE.md
        expected_model_count = 14

        registered_tables = [table.name for table in db.metadata.tables.values()]

        print(f"\nRegistered tables in metadata:")
        for table_name in registered_tables:
            print(f"  - {table_name}")

        assert len(registered_tables) >= expected_model_count, \
            f"Expected at least {expected_model_count} tables, but found {len(registered_tables)}"
        print(f"\n✅ Found {len(registered_tables)} registered tables")