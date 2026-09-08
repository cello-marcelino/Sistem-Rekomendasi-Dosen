import pytest

def test_client_registration(client):
    response = client.post("/api/clients/register", json={
        "name": "John Doe",
        "email": "john@test.com",
        "organization": "Test Corp",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.get_json()
    assert data["success"] is True
    assert "api_key" in data["data"]
    assert "token" in data["data"]

def test_client_login(client):
    client.post("/api/clients/register", json={
        "name": "Jane Doe",
        "email": "jane@test.com",
        "organization": "Test Corp",
        "password": "password123"
    })
    
    response = client.post("/api/clients/login", json={
        "email": "jane@test.com",
        "password": "password123"
    })
    assert response.status_code == 200
    data = response.get_json()
    assert data["success"] is True
    assert "token" in data["data"]

