from app.database.database import engine
from sqlalchemy import text

def drop_tables():
    with engine.connect() as conn:
        print("Dropping games table...")
        conn.execute(text("DROP TABLE IF EXISTS games"))
        conn.commit()
    print("Table dropped successfully.")

if __name__ == "__main__":
    drop_tables()
