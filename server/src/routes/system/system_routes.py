from flask import Blueprint
from server.src.middleware.security_middleware import require_admin_key, require_api_key
from server.src.controllers.system.system_controller import SystemController

system_bp = Blueprint('system', __name__)

# Health check endpoint (Public for container & uptime probes)
@system_bp.route('/health', methods=['GET'])
def health_check():
    return SystemController.get_health()

# Status endpoints (Protected with API key)
@system_bp.route('/system/status', methods=['GET'])
@system_bp.route('/status', methods=['GET'])
@require_api_key
def get_status():
    return SystemController.get_status()

# Runtime configuration endpoints
@system_bp.route('/system/config', methods=['GET'])
@system_bp.route('/config', methods=['GET'])
@require_api_key
def get_config():
    return SystemController.get_config()

@system_bp.route('/system/config', methods=['PATCH', 'PUT'])
@system_bp.route('/config', methods=['PATCH', 'PUT'])
@require_admin_key
def update_config():
    return SystemController.update_config()

# Sandbox simulation endpoint (Protected with API key)
@system_bp.route('/system/config/simulate', methods=['POST'])
@system_bp.route('/config/simulate', methods=['POST'])
@require_api_key
def simulate_config():
    return SystemController.simulate_config()

# Reset configuration endpoint (Protected with Admin key)
@system_bp.route('/system/config/reset', methods=['POST'])
@system_bp.route('/config/reset', methods=['POST'])
@require_admin_key
def reset_config():
    return SystemController.reset_config()

# System reload endpoint
@system_bp.route('/system/reload', methods=['POST'])
@require_admin_key
def reload_system():
    return SystemController.reload_system()
