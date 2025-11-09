from src.app import app
from src.config import db
from src.models import *
from sqlalchemy import inspect

def types_compatible(orm_type, db_type):
    orm = str(orm_type).lower()
    db = str(db_type).lower()
    
    if orm in ['datetime', 'timestamp'] and db in ['datetime', 'timestamp']:
        return True
    if orm == 'boolean' and 'tinyint' in db:
        return True
    if 'enum' in orm and 'varchar' in db:
        return True
    if 'varchar' in orm and 'enum' in db:
        return True
    return orm in db or db in orm

def test_model_schema():
    with app.app_context():
        inspector = inspect(db.engine)
        all_pass = True

        for full_table_name, table in db.metadata.tables.items():
            print(f"\ncheck Table: {full_table_name}")

            if '.' in full_table_name:
                schema, table_name = full_table_name.split('.', 1)
            else:
                schema = None
                table_name = full_table_name

            if not inspector.has_table(table_name, schema=schema):
                print(f"FAILED No Table: {full_table_name}")
                all_pass = False
                continue

            db_cols = {c['name']: c for c in inspector.get_columns(table_name, schema=schema)}
            orm_cols = {c.name: c for c in table.columns}

            for col_name, orm_col in orm_cols.items():
                if col_name not in db_cols:
                    print(f"FAILED ORM redundant Column: {col_name}")
                    all_pass = False
                    continue

                db_col = db_cols[col_name]
                issues = []

                # 型別比對（寬鬆）
                if not types_compatible(orm_col.type, db_col['type']):
                    issues.append(f"Type Error: ORM={orm_col.type}, DB={db_col['type']}")

                # nullable
                if orm_col.nullable != db_col['nullable']:
                    issues.append(f"NULL Error: ORM={orm_col.nullable}, DB={db_col['nullable']}")

                if issues:
                    print(f"Warning [{col_name}] diffrent (Is Ok):")
                    for issue in issues:
                        print(f"   → {issue}")
                else:
                    print(f"success {col_name}")

        print("\n" + "="*60)
        assert all_pass, "There are some Table not exist!"