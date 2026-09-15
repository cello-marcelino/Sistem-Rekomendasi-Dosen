from flask import request, current_app
from server.src.config.config import Config
from server.src.config.response import ResponseFormatter
from server.src.exceptions.app_exceptions import ValidationError
from server.src.services.system.cache_service import CacheService
from server.src.services.system.config_service import ConfigService

class SystemController:
    """Handles system status, health checks, runtime configuration, and sandbox simulations."""
    
    @staticmethod
    def get_status():
        cache = CacheService.get_instance()
        state = cache.warmup_status.get("state", "idle") if hasattr(cache, 'warmup_status') else ("ready" if cache.is_ready else "warming_up")
        return ResponseFormatter.success(
            data={
                "status": state,
                "app_name": Config.APP_NAME,
                "environment": Config.APP_ENV,
                "cache_ready": cache.is_ready,
                "total_dosen": len(cache.dosen_list) if cache.is_ready else 0,
                "device": Config.TORCH_DEVICE.upper(),
                "warmup_status": cache.warmup_status
            },
            message="Status sistem berhasil diambil"
        )

    @staticmethod
    def get_health():
        cache = CacheService.get_instance()
        status_code = 200 if cache.is_ready else 503
        return ResponseFormatter.success(
            data={
                "status": "healthy" if cache.is_ready else "warming_up",
                "cache_ready": cache.is_ready,
                "warmup_status": cache.warmup_status
            },
            status_code=status_code,
            message="Health check"
        )

    @staticmethod
    def get_config():
        config = ConfigService.get_config()
        return ResponseFormatter.success(data=config, message="Konfigurasi sistem berhasil diambil")

    @staticmethod
    def update_config():
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            raise ValidationError("Request body harus berupa JSON object yang valid")
            
        # Smart dirty checking: only trigger re-indexing if corpus weights ACTUALLY changed numerically
        is_testing = current_app.config.get('TESTING', False)
        corpus_keys = {"weight_keahlian", "weight_publikasi", "weight_bimbingan", "weight_pengujian"}
        current_cfg = ConfigService.get_config()
        weights_changed = False
        for k in corpus_keys:
            if k in data:
                try:
                    if int(data[k]) != int(current_cfg.get(k, 0)):
                        weights_changed = True
                        break
                except (ValueError, TypeError):
                    pass
            
        updated = ConfigService.update_config(data)
        
        # If corpus weighting really changed, trigger fast background re-indexing automatically
        if not is_testing and weights_changed:
            cache = CacheService.get_instance()
            cache.initialize_cache_async(force_refresh=True, force_keybert=False)
            
        return ResponseFormatter.success(data=updated, message="Konfigurasi sistem berhasil diperbarui")

    @staticmethod
    def reset_config():
        reset_cfg = ConfigService.reset_to_default()
        is_testing = current_app.config.get('TESTING', False)
        if not is_testing:
            cache = CacheService.get_instance()
            cache.initialize_cache_async(force_refresh=True, force_keybert=False)
            
        return ResponseFormatter.success(
            data=reset_cfg, 
            message="Konfigurasi sistem berhasil di-reset ke pengaturan baseline pabrik"
        )

    @staticmethod
    def simulate_config():
        data = request.get_json(silent=True)
        if not data or not isinstance(data, dict):
            raise ValidationError("Request body harus berupa JSON object yang valid")
            
        judul = str(data.get('judul', '') or '').strip()
        abstrak = str(data.get('abstrak', '') or '').strip()
        k_rank = data.get('k_rank')
        draft_config = data.get('draft_config', {})
        
        if not judul and not abstrak:
            raise ValidationError("Judul atau abstrak harus diisi untuk melakukan simulasi sandbox")
            
        sanitized_draft = ConfigService.validate_and_sanitize(draft_config) if draft_config else {}
        
        from server.src.services.recommendation.recommendation_service import RecommendationService
        current_recom = RecommendationService.get_recommendations(judul, abstrak, k_rank)
        simulated_recom = RecommendationService.get_recommendations(
            judul, abstrak, k_rank, override_config=sanitized_draft
        )
        
        return ResponseFormatter.success(
            data={
                "current": current_recom,
                "simulated": simulated_recom,
                "draft_config_applied": sanitized_draft
            },
            message="Simulasi konfigurasi sandbox berhasil dihitung"
        )

    @staticmethod
    def reload_system():
        cache = CacheService.get_instance()
        cache.initialize_cache_async(force_refresh=True, force_keybert=False)
        return ResponseFormatter.success(
            data={
                "status": cache.warmup_status.get("state", "reloading"),
                "cache_ready": cache.is_ready,
                "warmup_status": cache.warmup_status
            },
            message="Proses reload dan re-indexing NLP engine dimulai di background"
        )
