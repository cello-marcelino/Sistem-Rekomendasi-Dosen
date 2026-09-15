from functools import wraps
from flask import request, current_app, has_app_context, g
from server.src.config.config import Config
from server.src.exceptions.app_exceptions import AuthenticationError

def extract_credential():
    """Extract API key or Bearer token from request headers or query params."""
    api_key = request.headers.get('X-API-Key')
    if api_key and api_key.strip():
        return api_key.strip()
        
    auth_header = request.headers.get('Authorization', '')
    if auth_header:
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ', 1)[1].strip()
            if token:
                return token
        elif auth_header.strip():
            return auth_header.strip()
            
    # Optional query parameter
    query_key = request.args.get('api_key')
    if query_key and query_key.strip():
        return query_key.strip()
        
    return None

def verify_token_or_key(credential: str):
    """
    Verifies if the given credential is:
    1. Master ADMIN_API_KEY
    2. Active registered Client API Key in database (e.g. srd_live_...)
    3. Valid Client HMAC session token
    4. Valid Admin HMAC session token
    Returns dict with auth metadata if valid, otherwise None.
    """
    if not credential:
        return None
        
    # 1. Master Admin API Key
    expected_admin = current_app.config.get('ADMIN_API_KEY', Config.ADMIN_API_KEY) if has_app_context() else Config.ADMIN_API_KEY
    if credential == expected_admin:
        return {"type": "master_admin", "identifier": "admin"}
        
    # 2. Check Registered Client API Key in DB
    try:
        from server.src.repositories.client.client_repository import ClientRepository
        client = ClientRepository().get_by_api_key(credential)
        if client and getattr(client, 'is_active', 1):
            return {"type": "client_api_key", "client_id": client.client_id, "client": client}
    except Exception:
        pass

    # 3. Check Client Session Token
    try:
        from server.src.services.client.client_auth_service import ClientAuthService
        client_auth = ClientAuthService()
        if client_auth.verify_token(credential):
            client_id = client_auth.get_client_id_from_token(credential)
            return {"type": "client_token", "client_id": client_id}
    except Exception:
        pass

    # 4. Check Admin Session Token
    try:
        from server.src.services.admin.admin_auth_service import AdminAuthService
        admin_payload = AdminAuthService.verify_token(credential)
        if admin_payload:
            return {"type": "admin_token", "payload": admin_payload}
    except Exception:
        pass

    return None

def require_api_key(f):
    """
    Decorator requiring a valid and active API key or token for protected endpoints.
    Denies access with 401 Unauthorized if the key is missing, invalid, or revoked/regenerated.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return current_app.make_default_options_response()

        credential = extract_credential()
        if not credential:
            raise AuthenticationError("Akses ditolak: Token atau API Key diperlukan (sediakan header 'X-API-Key' atau 'Authorization: Bearer <token>')")
            
        auth_info = verify_token_or_key(credential)
        if not auth_info:
            raise AuthenticationError("Akses ditolak: API Key atau Token tidak valid, tidak aktif, atau telah digenerate ulang")
            
        g.auth_info = auth_info
        if "client" in auth_info:
            g.client = auth_info["client"]
            
        return f(*args, **kwargs)
    return decorated_function

def require_admin_key(f):
    """Decorator to require master admin key or valid admin/client credential."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if request.method == 'OPTIONS':
            return current_app.make_default_options_response()

        credential = extract_credential()
        if not credential:
            raise AuthenticationError("Akses ditolak: Kredensial otentikasi diperlukan")
            
        auth_info = verify_token_or_key(credential)
        if not auth_info:
            raise AuthenticationError("Akses ditolak: Kredensial tidak valid atau tidak terdaftar")
            
        g.auth_info = auth_info
        return f(*args, **kwargs)
    return decorated_function
