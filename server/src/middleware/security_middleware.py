from functools import wraps
from flask import request, current_app, has_app_context
from server.src.config.config import Config
from server.src.exceptions.app_exceptions import AuthenticationError

def require_admin_key(f):
    """Decorator to require X-API-Key or Authorization header matching ADMIN_API_KEY."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        if not api_key:
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                api_key = auth_header.split(' ', 1)[1]
            else:
                api_key = auth_header
                
        expected_key = current_app.config.get('ADMIN_API_KEY', Config.ADMIN_API_KEY) if has_app_context() else Config.ADMIN_API_KEY
        if api_key == expected_key:
            return f(*args, **kwargs)
            
        # Fallback to check if it's a registered client API key
        try:
            from server.src.repositories.client.client_repository import ClientRepository
            client = ClientRepository().get_by_api_key(api_key)
            if client and client.is_active:
                return f(*args, **kwargs)
        except Exception:
            pass
            
        raise AuthenticationError("Akses ditolak: API Key tidak valid atau tidak terdaftar")
    return decorated_function
