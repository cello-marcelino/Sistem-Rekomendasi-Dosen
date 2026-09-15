from functools import wraps
from flask import Blueprint, request
from server.src.controllers.admin.admin_auth_controller import AdminAuthController
from server.src.controllers.admin.admin_config_controller import AdminConfigController
from server.src.controllers.admin.admin_dosen_controller import AdminDosenController
from server.src.controllers.recommendation.recommendation_controller import RecommendationController
from server.src.services.admin.admin_auth_service import AdminAuthService
from server.src.exceptions.app_exceptions import AuthenticationError
from server.src.middleware.security_middleware import extract_credential, verify_token_or_key

admin_bp = Blueprint('admin', __name__)

def require_admin_auth(f):
    """Middleware decorator enforcing valid admin token or admin/client API key."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = extract_credential()
        if not token:
            raise AuthenticationError("Akses ditolak: Token otorisasi admin tidak ditemukan")
            
        auth_info = verify_token_or_key(token)
        if not auth_info:
            raise AuthenticationError("Akses ditolak: Sesi atau API Key admin tidak valid / kadaluarsa")
                
        return f(*args, **kwargs)
    return decorated_function


# --- Admin Authentication Routes ---
@admin_bp.route('/auth/login', methods=['POST'])
def login():
    return AdminAuthController.login()

@admin_bp.route('/auth/me', methods=['GET'])
@require_admin_auth
def get_me():
    return AdminAuthController.get_me()

@admin_bp.route('/auth/logout', methods=['POST'])
@require_admin_auth
def logout():
    return AdminAuthController.logout()

# --- Admin Engine Config Routes ---
@admin_bp.route('/config', methods=['GET'])
@require_admin_auth
def get_config():
    return AdminConfigController.get_config()

@admin_bp.route('/config', methods=['PUT', 'PATCH'])
@require_admin_auth
def update_config():
    return AdminConfigController.update_config()

# --- Admin Dosen Data Management Routes ---
@admin_bp.route('/dosen', methods=['GET'])
@require_admin_auth
def get_all_dosen():
    return AdminDosenController.get_all()

@admin_bp.route('/dosen/<dosen_id>', methods=['GET'])
@require_admin_auth
def get_dosen_detail(dosen_id):
    return AdminDosenController.get_detail(dosen_id)

@admin_bp.route('/dosen', methods=['POST'])
@require_admin_auth
def create_dosen():
    return AdminDosenController.create()

@admin_bp.route('/dosen/<dosen_id>', methods=['PUT'])
@require_admin_auth
def update_dosen(dosen_id):
    return AdminDosenController.update(dosen_id)

@admin_bp.route('/dosen/<dosen_id>', methods=['DELETE'])
@require_admin_auth
def delete_dosen(dosen_id):
    return AdminDosenController.delete(dosen_id)

# --- Admin Batch Recommendation Simulation Route ---
@admin_bp.route('/recommendation/batch', methods=['POST'])
@require_admin_auth
def batch_recommendation():
    return RecommendationController.batch_recommendation()

