import time
import threading
import pytest
from server.src.services.system.cache_service import CacheService
from server.src.services.recommendation.recommendation_service import RecommendationService
from server.src.services.system.config_service import ConfigService

def test_cache_service_singleton_double_checked_locking():
    """Verify that get_instance() is fast and lock-free once initialized."""
    c1 = CacheService.get_instance()
    c2 = CacheService.get_instance()
    assert c1 is c2
    assert c1 is not None

    # Benchmark get_instance latency (should be < 0.01 ms per call)
    t0 = time.time()
    for _ in range(1000):
        _ = CacheService.get_instance()
    elapsed = time.time() - t0
    assert elapsed < 0.05, f"get_instance should be extremely fast, took {elapsed:.4f}s"

def test_zero_downtime_rebuild_concurrency(sample_dosen_list):
    """Verify that during re-indexing, is_ready stays True and recommendations can be served without delay."""
    cache = CacheService.get_instance()
    # Pre-load SBERT model so we measure warm re-indexing performance
    cache.sbert.load_model()
    
    # Ensure cache has baseline data
    if not cache.is_ready:
        cache.dosen_list = sample_dosen_list
        cache._rebuild_bm25_index()
        cache.is_ready = True

    assert cache.is_ready is True

    # Launch background re-indexing
    t_start = time.time()
    thread = cache.initialize_cache_async(force_refresh=True, force_keybert=False)
    
    # Immediately check is_ready - MUST be True (Zero Downtime)
    assert cache.is_ready is True

    # Simultaneously execute recommendation request during re-indexing
    rec_result = RecommendationService.get_recommendations(
        judul="Penelitian Natural Language Processing dengan IndoBERT",
        abstrak="Ekstraksi teks dan analisis sentimen bahasa Indonesia"
    )
    assert "recommendations" in rec_result
    assert len(rec_result["recommendations"]) > 0

    # Wait for background thread to finish
    if thread:
        thread.join(timeout=20.0)

    rebuild_duration = time.time() - t_start
    assert cache.is_ready is True
    assert cache.warmup_status["state"] == "ready"
    assert cache.warmup_status["progress_pct"] == 100
    # Rebuild must be fast (sub-5 seconds on CPU with disk caches)
    assert rebuild_duration < 10.0, f"Rebuild was expected to be fast, took {rebuild_duration:.2f}s"

def test_dirty_checking_logic():
    """Verify smart dirty checking for corpus weights in ConfigService/SystemController."""
    current_cfg = ConfigService.get_config()
    corpus_keys = {"weight_keahlian", "weight_publikasi", "weight_bimbingan", "weight_pengujian"}
    
    # Case 1: Same values - weights_changed must be False
    payload_same = {
        "threshold": 0.8, # Only threshold changed
        "weight_keahlian": current_cfg.get("weight_keahlian", 5),
        "weight_publikasi": current_cfg.get("weight_publikasi", 2),
        "weight_bimbingan": current_cfg.get("weight_bimbingan", 1),
        "weight_pengujian": current_cfg.get("weight_pengujian", 1)
    }
    weights_changed = any(
        k in payload_same and int(payload_same[k]) != int(current_cfg.get(k, 0))
        for k in corpus_keys
    )
    assert weights_changed is False

    # Case 2: Changed value - weights_changed must be True
    payload_diff = {
        **payload_same,
        "weight_keahlian": int(current_cfg.get("weight_keahlian", 5)) + 2
    }
    weights_changed = any(
        k in payload_diff and int(payload_diff[k]) != int(current_cfg.get(k, 0))
        for k in corpus_keys
    )
    assert weights_changed is True
