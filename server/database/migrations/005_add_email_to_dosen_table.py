"""
Migration 005: Add email Column to dosen Table
Adds 'email' column to the dosen master table (nullable / empty initially).
"""

def up(conn, driver: str = 'sqlite'):
    cursor = conn.cursor()
    col_def = "TEXT NULL" if driver == 'sqlite' else "VARCHAR(255) NULL"
    
    if driver == 'sqlite':
        cursor.execute("PRAGMA table_info(dosen);")
        existing_cols = {row[1] for row in cursor.fetchall()}
    else:
        cursor.execute("SHOW COLUMNS FROM dosen;")
        existing_cols = {row[0] if isinstance(row, (list, tuple)) else row['Field'] for row in cursor.fetchall()}
        
    if "email" not in existing_cols:
        cursor.execute(f"ALTER TABLE dosen ADD COLUMN email {col_def};")
        
    conn.commit()
    cursor.close()

def down(conn, driver: str = 'sqlite'):
    pass
