from typing import Optional
import sqlite3
from server.database.connection.database import DatabaseManager
from server.src.models.client.client_model import Client

class ClientRepository:
    def get_by_email(self, email: str) -> Optional[Client]:
        conn = DatabaseManager.get_connection()
        if not conn: return None
        is_sqlite = isinstance(conn, sqlite3.Connection)
        cursor = conn.cursor() if is_sqlite else conn.cursor(dictionary=True)
        try:
            sql = "SELECT * FROM clients WHERE email = ?" if is_sqlite else "SELECT * FROM clients WHERE email = %s"
            cursor.execute(sql, (email,))
            row = cursor.fetchone()
            if row:
                data = dict(row) if hasattr(row, "keys") else dict(zip([col[0] for col in cursor.description], row))
                return Client(**data)
            return None
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def get_by_api_key(self, api_key: str) -> Optional[Client]:
        conn = DatabaseManager.get_connection()
        if not conn: return None
        is_sqlite = isinstance(conn, sqlite3.Connection)
        cursor = conn.cursor() if is_sqlite else conn.cursor(dictionary=True)
        try:
            sql = "SELECT * FROM clients WHERE api_key = ?" if is_sqlite else "SELECT * FROM clients WHERE api_key = %s"
            cursor.execute(sql, (api_key,))
            row = cursor.fetchone()
            if row:
                data = dict(row) if hasattr(row, "keys") else dict(zip([col[0] for col in cursor.description], row))
                return Client(**data)
            return None
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
            
    def get_by_id(self, client_id: str) -> Optional[Client]:
        conn = DatabaseManager.get_connection()
        if not conn: return None
        is_sqlite = isinstance(conn, sqlite3.Connection)
        cursor = conn.cursor() if is_sqlite else conn.cursor(dictionary=True)
        try:
            sql = "SELECT * FROM clients WHERE client_id = ?" if is_sqlite else "SELECT * FROM clients WHERE client_id = %s"
            cursor.execute(sql, (client_id,))
            row = cursor.fetchone()
            if row:
                data = dict(row) if hasattr(row, "keys") else dict(zip([col[0] for col in cursor.description], row))
                return Client(**data)
            return None
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

    def create(self, client_data: dict) -> Client:
        conn = DatabaseManager.get_connection()
        if not conn: raise Exception("No DB connection")
        is_sqlite = isinstance(conn, sqlite3.Connection)
        cursor = conn.cursor() if is_sqlite else conn.cursor(dictionary=True)
        try:
            sql = """
            INSERT INTO clients (client_id, name, email, organization, password_hash, api_key)
            VALUES (?, ?, ?, ?, ?, ?)
            """ if is_sqlite else """
            INSERT INTO clients (client_id, name, email, organization, password_hash, api_key)
            VALUES (%s, %s, %s, %s, %s, %s)
            """
            params = (
                client_data["client_id"],
                client_data["name"],
                client_data["email"],
                client_data["organization"],
                client_data["password_hash"],
                client_data["api_key"]
            )
            cursor.execute(sql, params)
            conn.commit()
            return self.get_by_email(client_data["email"])
        finally:
            if cursor: cursor.close()
            if conn: conn.close()
        
    def update_api_key(self, client_id: str, new_api_key: str) -> bool:
        conn = DatabaseManager.get_connection()
        if not conn: return False
        is_sqlite = isinstance(conn, sqlite3.Connection)
        cursor = conn.cursor() if is_sqlite else conn.cursor(dictionary=True)
        try:
            sql = "UPDATE clients SET api_key = ?, updated_at = CURRENT_TIMESTAMP WHERE client_id = ?" if is_sqlite else "UPDATE clients SET api_key = %s, updated_at = CURRENT_TIMESTAMP WHERE client_id = %s"
            cursor.execute(sql, (new_api_key, client_id))
            conn.commit()
            return True
        except Exception:
            return False
        finally:
            if cursor: cursor.close()
            if conn: conn.close()

