import json

def test_get_health(client):
    response = client.get('/health')
    assert response.status_code in (200, 503)
    data = response.get_json()
    assert data["success"] is True
    assert "status" in data["data"]

def test_get_system_status(client, sample_dosen_list):
    response = client.get('/api/system/status', headers={"X-API-Key": "test-admin-key"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert data["data"]["status"] in ["online", "idle"]
    assert data["data"]["total_dosen"] == len(sample_dosen_list)

def test_get_dosen_list(client, sample_dosen_list):
    response = client.get('/api/dosen', headers={"X-API-Key": "test-admin-key"})
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert len(data["data"]) == len(sample_dosen_list)
    assert data["data"][0]["nama"] == "Dr. Andi Wijaya, M.Kom."

def test_get_and_patch_config(client):
    # Get config
    get_res = client.get('/api/system/config', headers={"X-API-Key": "test-admin-key"})
    assert get_res.status_code == 200
    assert get_res.get_json()["success"] is True
    
    # Patch config with valid API key
    patch_payload = {"manual_alpha": 0.6, "is_adaptive": False}
    patch_res = client.patch(
        '/api/system/config',
        json=patch_payload,
        headers={"X-API-Key": "test-admin-key"}
    )
    assert patch_res.status_code == 200
    patch_data = patch_res.get_json()
    assert patch_data["success"] is True
    assert patch_data["data"]["manual_alpha"] == 0.6
    assert patch_data["data"]["is_adaptive"] is False

def test_patch_config_unauthorized(client):
    patch_payload = {"manual_alpha": 0.6}
    patch_res = client.patch('/api/system/config', json=patch_payload)
    assert patch_res.status_code == 401
    assert patch_res.get_json()["success"] is False

def test_reset_config(client):
    res = client.post('/api/system/config/reset', headers={"X-API-Key": "test-admin-key"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert data["data"]["threshold"] == 0.3
    assert data["data"]["weight_keahlian"] == 5

def test_simulate_config(client, sample_dosen_list):
    payload = {
        "judul": "Analisis Sentimen Menggunakan IndoBERT",
        "abstrak": "Pengolahan bahasa alami dengan transformer untuk teks bahasa Indonesia.",
        "k_rank": 3,
        "draft_config": {
            "is_adaptive": False,
            "manual_alpha": 0.9
        }
    }
    res = client.post('/api/system/config/simulate', json=payload, headers={"X-API-Key": "test-admin-key"})
    assert res.status_code == 200
    data = res.get_json()
    assert data["success"] is True
    assert "current" in data["data"]
    assert "simulated" in data["data"]
    assert data["data"]["draft_config_applied"]["manual_alpha"] == 0.9

def test_simulate_config_preflight_cors_options(client):
    res = client.options(
        '/api/system/config/simulate',
        headers={
            'Origin': 'http://localhost:5174',
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'content-type,x-api-key,authorization'
        }
    )
    assert res.status_code == 200
    assert res.headers.get('Access-Control-Allow-Origin') == 'http://localhost:5174'
    assert 'POST' in res.headers.get('Access-Control-Allow-Methods', '')

