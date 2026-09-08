import os
import time
import hmac
import hashlib
import base64
import re
import secrets
import uuid
from werkzeug.security import generate_password_hash, check_password_hash
from server.src.config.config import Config
from server.src.repositories.client.client_repository import ClientRepository
from server.src.exceptions.app_exceptions import AuthenticationError, ValidationError
from server.src.models.client.client_model import Client

class ClientAuthService:
    def __init__(self):
        self.repo = ClientRepository()
        self.secret_key = Config.SECRET_KEY.encode()

    def generate_api_key(self) -> str:
        return f"srd_live_{secrets.token_hex(24)}"

    def generate_token(self, client_id: str, email: str) -> str:
        timestamp = int(time.time())
        payload = f"{client_id}:{email}:{timestamp}".encode()
        signature = hmac.new(self.secret_key, payload, hashlib.sha256).hexdigest()
        token_str = f"{payload.decode()}:{signature}"
        return base64.urlsafe_b64encode(token_str.encode()).decode()

    def verify_token(self, token: str) -> bool:
        try:
            decoded = base64.urlsafe_b64decode(token.encode()).decode()
            parts = decoded.split(":")
            if len(parts) != 4:
                return False
            client_id, email, timestamp, signature = parts
            
            # Check expiry (7 days)
            if int(time.time()) - int(timestamp) > 604800:
                return False
                
            expected_payload = f"{client_id}:{email}:{timestamp}".encode()
            expected_signature = hmac.new(self.secret_key, expected_payload, hashlib.sha256).hexdigest()
            return hmac.compare_digest(signature, expected_signature)
        except Exception:
            return False

    def get_client_id_from_token(self, token: str) -> str:
        try:
            decoded = base64.urlsafe_b64decode(token.encode()).decode()
            return decoded.split(":")[0]
        except Exception:
            return None

    def register(self, data: dict) -> dict:
        required = ["name", "email", "organization", "password"]
        for field in required:
            if not data.get(field):
                raise ValidationError(f"Field {field} is required")
                
        if not re.match(r"[^@]+@[^@]+\.[^@]+", data["email"]):
            raise ValidationError("Format email tidak valid")
            
        if len(data["password"]) < 6:
            raise ValidationError("Password minimal 6 karakter")
            
        existing = self.repo.get_by_email(data["email"])
        if existing:
            raise ValidationError("Email sudah terdaftar")
            
        client_data = {
            "client_id": f"CLT-{uuid.uuid4().hex[:8]}",
            "name": data["name"],
            "email": data["email"],
            "organization": data["organization"],
            "password_hash": generate_password_hash(data["password"]),
            "api_key": self.generate_api_key()
        }
        
        client = self.repo.create(client_data)
        token = self.generate_token(client.client_id, client.email)
        
        return {
            "client": client.to_dict(),
            "api_key": client.api_key,
            "token": token
        }

    def login(self, email: str, password: str) -> dict:
        client = self.repo.get_by_email(email)
        if not client or not check_password_hash(client.password_hash, password):
            raise AuthenticationError("Email atau password salah")
            
        if not client.is_active:
            raise AuthenticationError("Akun tidak aktif")
            
        token = self.generate_token(client.client_id, client.email)
        return {
            "client": client.to_dict(),
            "api_key": client.api_key,
            "token": token
        }
        
    def authenticate_by_api_key(self, api_key: str) -> Client:
        client = self.repo.get_by_api_key(api_key)
        if not client or not client.is_active:
            return None
        return client
        
    def get_client_by_id(self, client_id: str) -> Client:
        return self.repo.get_by_id(client_id)
        
    def regenerate_api_key(self, client_id: str) -> str:
        new_key = self.generate_api_key()
        success = self.repo.update_api_key(client_id, new_key)
        if not success:
            raise AuthenticationError("Gagal update API key")
        return new_key

