from flask import Blueprint
from server.src.middleware.security_middleware import require_api_key
from server.src.controllers.recommendation.recommendation_controller import RecommendationController

recommendation_bp = Blueprint('recommendation', __name__)

# Single recommendation routes
@recommendation_bp.route('/recommendations', methods=['POST'])
@recommendation_bp.route('/recommendations/single', methods=['POST'])
@recommendation_bp.route('/rekomendasi/single', methods=['POST'])
@require_api_key
def single_recommendation():
    return RecommendationController.single_recommendation()

# Batch recommendation routes
@recommendation_bp.route('/recommendations/batch', methods=['POST'])
@recommendation_bp.route('/rekomendasi/batch', methods=['POST'])
@require_api_key
def batch_recommendation():
    return RecommendationController.batch_recommendation()

# Batch upload Excel routes
@recommendation_bp.route('/recommendations/upload', methods=['POST'])
@recommendation_bp.route('/recommendations/batch/upload', methods=['POST'])
@recommendation_bp.route('/rekomendasi/batch/upload', methods=['POST'])
@require_api_key
def batch_upload():
    return RecommendationController.batch_upload()

# SSE Stream recommendation routes
@recommendation_bp.route('/recommendations/stream', methods=['POST'])
@recommendation_bp.route('/rekomendasi/stream', methods=['POST'])
@require_api_key
def stream_recommendation():
    return RecommendationController.stream_recommendation()

