def test_login():
    assert Truefrom fastapi.testclient import TestClient # type: ignore
from app.main import app

client = TestClient(app) # type: ignore


def test_login_user():
    response = client.post(
        "/auth/login",
        json={"email": "user@test.com", "role": "user"},
    )

    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_admin():
    response = client.post(
        "/auth/login",
        json={"email": "admin@test.com", "role": "admin"},
    )

    assert response.status_code == 200
    assert "access_token" in response.json()