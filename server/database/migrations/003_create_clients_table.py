from server.database.connection.database import DatabaseManager
import sqlite3

def up(conn, driver: str = 'sqlite'):
    """Create the clients table."""
    cursor = conn.cursor()
    
    # Check if table already exists
    try:
        if driver == 'sqlite':
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='clients';")
        else:
            cursor.execute("SHOW TABLES LIKE 'clients'")
        result = cursor.fetchall()
        
        if result:
            return

        if driver == 'mysql':
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS clients (
                id INT AUTO_INCREMENT PRIMARY KEY,
                client_id VARCHAR(50) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                organization VARCHAR(255) NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                api_key VARCHAR(100) UNIQUE NOT NULL,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """
        else:
            create_table_sql = """
            CREATE TABLE IF NOT EXISTS clients (
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
    finally:
        cursor.close()

def down(conn, driver: str = 'sqlite'):
    """Drop the clients table."""
    cursor = conn.cursor()
    try:
        cursor.execute("DROP TABLE IF EXISTS clients;")
        conn.commit()
    finally:
        cursor.close()


