from server.database.connection.database import DatabaseManager
import sqlite3

def up():
    """Create the clients table."""
    conn = DatabaseManager.get_connection()
    if not conn:
        print("[MIGRATE] Gagal mendapatkan koneksi database")
        return
        
    is_sqlite = isinstance(conn, sqlite3.Connection)
    cursor = conn.cursor() if is_sqlite else conn.cursor(dictionary=True)
    
    # Check if table already exists
    try:
        if is_sqlite:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='clients';")
        else:
            cursor.execute("SHOW TABLES LIKE 'clients'")
        result = cursor.fetchall()
        
        if result:
            print("[MIGRATE] Tabel `clients` sudah ada. Melewati pembuatan tabel.")
            return

        create_table_sql = """
        CREATE TABLE clients (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            client_id VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            organization VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            api_key VARCHAR(100) UNIQUE NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """
        if is_sqlite:
             create_table_sql = """
             CREATE TABLE clients (
                 id INTEGER PRIMARY KEY AUTOINCREMENT,
                 client_id VARCHAR(50) UNIQUE NOT NULL,
                 name VARCHAR(255) NOT NULL,
                 email VARCHAR(255) UNIQUE NOT NULL,
                 organization VARCHAR(255) NOT NULL,
                 password_hash VARCHAR(255) NOT NULL,
                 api_key VARCHAR(100) UNIQUE NOT NULL,
                 is_active BOOLEAN DEFAULT 1,
                 created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                 updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
             );
             """
             
        cursor.execute(create_table_sql)
        conn.commit()
        print("[MIGRATE] Berhasil membuat tabel `clients`.")
    except Exception as e:
        print(f"[MIGRATE] Gagal membuat tabel `clients`: {e}")
        raise e
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

def down():
    """Drop the clients table."""
    conn = DatabaseManager.get_connection()
    if not conn:
        return
    cursor = conn.cursor()
    drop_table_sql = "DROP TABLE IF EXISTS clients;"
    try:
        cursor.execute(drop_table_sql)
        conn.commit()
        print("[MIGRATE] Berhasil menghapus tabel `clients`.")
    except Exception as e:
        print(f"[MIGRATE] Gagal menghapus tabel `clients`: {e}")
        raise e
    finally:
        if cursor: cursor.close()
        if conn: conn.close()

