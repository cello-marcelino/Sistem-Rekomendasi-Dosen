"""
Migration 004: Expand Engine Configurations Table
Adds columns for corpus field weights, BM25 fine-tuning, adaptive alpha splits, and academic filters.
"""

def up(conn, driver: str = 'sqlite'):
    cursor = conn.cursor()
    
    new_columns = [
        ("weight_keahlian", "INTEGER DEFAULT 5" if driver == 'sqlite' else "INT DEFAULT 5"),
        ("weight_publikasi", "INTEGER DEFAULT 2" if driver == 'sqlite' else "INT DEFAULT 2"),
        ("weight_bimbingan", "INTEGER DEFAULT 1" if driver == 'sqlite' else "INT DEFAULT 1"),
        ("weight_pengujian", "INTEGER DEFAULT 1" if driver == 'sqlite' else "INT DEFAULT 1"),
        ("bm25_k1", "REAL DEFAULT 1.5" if driver == 'sqlite' else "FLOAT DEFAULT 1.5"),
        ("bm25_b", "REAL DEFAULT 0.75" if driver == 'sqlite' else "FLOAT DEFAULT 0.75"),
        ("adaptive_short_alpha", "REAL DEFAULT 0.70" if driver == 'sqlite' else "FLOAT DEFAULT 0.70"),
        ("adaptive_long_alpha", "REAL DEFAULT 0.35" if driver == 'sqlite' else "FLOAT DEFAULT 0.35"),
        ("strict_prodi", "INTEGER DEFAULT 0" if driver == 'sqlite' else "TINYINT(1) DEFAULT 0"),
        ("top_k", "INTEGER DEFAULT 5" if driver == 'sqlite' else "INT DEFAULT 5"),
    ]
    
    # Check existing columns to avoid duplicate column errors
    if driver == 'sqlite':
        cursor.execute("PRAGMA table_info(engine_configs);")
        existing_cols = {row[1] for row in cursor.fetchall()}
    else:
        cursor.execute("SHOW COLUMNS FROM engine_configs;")
        existing_cols = {row[0] if isinstance(row, (list, tuple)) else row['Field'] for row in cursor.fetchall()}
        
    for col_name, col_def in new_columns:
        if col_name not in existing_cols:
            cursor.execute(f"ALTER TABLE engine_configs ADD COLUMN {col_name} {col_def};")
            
    conn.commit()
    cursor.close()

def down(conn, driver: str = 'sqlite'):
    # SQLite does not support dropping columns cleanly in older versions, so we skip down for SQLite
    pass
