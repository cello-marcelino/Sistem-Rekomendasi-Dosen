from flask import request
from server.src.config.response import ResponseFormatter
from server.src.services.client.client_auth_service import ClientAuthService
from server.src.exceptions.app_exceptions import AuthenticationError
from server.src.config.config import Config

class ClientAuthController:
    service = ClientAuthService()

    @classmethod
    def register(cls):
        data = request.get_json() or {}
        result = cls.service.register(data)
        return ResponseFormatter.success(result, message="Berhasil registrasi client", status_code=201)

    @classmethod
    def login(cls):
        data = request.get_json() or {}
        email = data.get("email")
        password = data.get("password")
        if not email or not password:
            raise AuthenticationError("Email dan password diperlukan")
        result = cls.service.login(email, password)
        return ResponseFormatter.success(result, message="Login berhasil")

    @classmethod
    def get_me(cls):
        auth_header = request.headers.get("Authorization", "")
        api_key_header = request.headers.get("X-API-Key", "")
        
        client = None
        if api_key_header:
            client = cls.service.authenticate_by_api_key(api_key_header)
        elif auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            if cls.service.verify_token(token):
                client_id = cls.service.get_client_id_from_token(token)
                client = cls.service.get_client_by_id(client_id)
                
        if not client:
            raise AuthenticationError("Sesi tidak valid atau telah berakhir")
            
        return ResponseFormatter.success(client.to_dict())

    @classmethod
    def verify_key(cls):
        api_key = request.headers.get("X-API-Key") or request.args.get("api_key")
        if not api_key:
            auth_header = request.headers.get("Authorization", "")
            if auth_header.startswith("Bearer "):
                api_key = auth_header.split(" ")[1]
            else:
                api_key = auth_header
                
        if not api_key:
            return ResponseFormatter.error("API Key tidak disediakan", code="UNAUTHORIZED", status_code=401)
            
        if api_key == Config.ADMIN_API_KEY:
            return ResponseFormatter.success({"valid": True, "type": "master_admin"})
            
        client = cls.service.authenticate_by_api_key(api_key)
        if client:
            return ResponseFormatter.success({
                "valid": True, 
                "type": "registered_client", 
                "client_id": client.client_id,
                "organization": client.organization
            })
            
        return ResponseFormatter.error("API Key tidak valid", code="UNAUTHORIZED", status_code=401)

    @classmethod
    def regenerate_key(cls):
        auth_header = request.headers.get("Authorization", "")
        client_id = None
        
        if auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
            if cls.service.verify_token(token):
                client_id = cls.service.get_client_id_from_token(token)
                
        if not client_id:
            api_key = request.headers.get("X-API-Key")
            client = cls.service.authenticate_by_api_key(api_key)
            if client:
                client_id = client.client_id
                
        if not client_id:
            raise AuthenticationError("Sesi tidak valid")
            
        new_key = cls.service.regenerate_api_key(client_id)
        return ResponseFormatter.success({"api_key": new_key, "client_id": client_id}, message="API Key baru berhasil diterbitkan")

