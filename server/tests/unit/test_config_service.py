import pytest
from server.src.exceptions.app_exceptions import ValidationError
from server.src.services.system.config_service import ConfigService

def test_validate_and_sanitize_valid_config():
    valid_payload = {
        "threshold": 0.25,
        "adaptive_alpha_threshold": 20,
        "is_adaptive": False,
        "manual_alpha": 0.6,
        "weight_keahlian": 7,
        "weight_publikasi": 3,
        "weight_bimbingan": 2,
        "weight_pengujian": 1,
        "bm25_k1": 1.8,
        "bm25_b": 0.65,
        "adaptive_short_alpha": 0.75,
        "adaptive_long_alpha": 0.30,
        "strict_prodi": True,
        "top_k": 10
    }
    sanitized = ConfigService.validate_and_sanitize(valid_payload)
    assert sanitized["threshold"] == 0.25
    assert sanitized["adaptive_alpha_threshold"] == 20
    assert sanitized["is_adaptive"] is False
    assert sanitized["manual_alpha"] == 0.6
    assert sanitized["weight_keahlian"] == 7
    assert sanitized["weight_publikasi"] == 3
    assert sanitized["bm25_k1"] == 1.8
    assert sanitized["bm25_b"] == 0.65
    assert sanitized["adaptive_short_alpha"] == 0.75
    assert sanitized["strict_prodi"] is True
    assert sanitized["top_k"] == 10

def test_validate_and_sanitize_discards_unknown_keys():
    payload_with_injection = {
        "manual_alpha": 0.5,
        "malicious_key": "some_payload",
        "secret_admin": True
    }
    sanitized = ConfigService.validate_and_sanitize(payload_with_injection)
    assert "malicious_key" not in sanitized
    assert "secret_admin" not in sanitized
    assert sanitized["manual_alpha"] == 0.5

def test_validate_and_sanitize_invalid_values():
    with pytest.raises(ValidationError):
        ConfigService.validate_and_sanitize({"manual_alpha": 1.5})  # > 1.0
        
    with pytest.raises(ValidationError):
        ConfigService.validate_and_sanitize({"threshold": -0.5})  # < 0.0
        
    with pytest.raises(ValidationError):
        ConfigService.validate_and_sanitize({"adaptive_alpha_threshold": 0})  # < 1

    with pytest.raises(ValidationError):
        ConfigService.validate_and_sanitize({"bm25_k1": 10.0})  # > 5.0

    with pytest.raises(ValidationError):
        ConfigService.validate_and_sanitize({"weight_keahlian": -1})  # < 0
