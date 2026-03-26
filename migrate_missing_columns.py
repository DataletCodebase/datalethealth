
from backend.app.models.mysql_models import engine
from sqlalchemy import text

def migrate():
    columns_to_add = [
        ("gender", "VARCHAR(20) DEFAULT 'NA'"),
        ("height", "VARCHAR(20) DEFAULT '0'"),
        ("weight", "VARCHAR(20) DEFAULT '0'"),
        ("blood_group", "VARCHAR(20) DEFAULT 'NA'"),
        ("city", "VARCHAR(100) DEFAULT 'NA'")
    ]
    
    with engine.connect() as conn:
        print("Checking for missing columns in 'users' table...")
        # Get existing columns
        result = conn.execute(text("SHOW COLUMNS FROM users"))
        existing_cols = [row[0] for row in result]
        
        for col_name, col_type in columns_to_add:
            if col_name not in existing_cols:
                print(f"Adding column '{col_name}'...")
                conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            else:
                print(f"Column '{col_name}' already exists.")
        
        print("Migration complete! ✅")

if __name__ == "__main__":
    migrate()
