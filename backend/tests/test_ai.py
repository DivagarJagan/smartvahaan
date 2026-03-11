from fastapi.testclient import TestClient # type: ignore
from app.main import app

client = TestClient(app)


def get_user_token():
    res = client.post(
        "/auth/login",
        json={"email": "user@test.com", "role": "user"},
    )
    return res.json()["access_token"]


def test_ai_prediction():
    token = get_user_token()

    # Add vehicle
    client.post(
        "/vehicles/",
        headers={"Authorization": f"Bearer {token}"},
        json={
            "model": "Hyundai i20",
            "fuel_type": "Petrol",
            "city": "Chennai",
            "distance": 65000,
        },
    )

    # Predict maintenance
    response = client.get(
        "/ai/predict",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 200
    data = response.json()

    assert "severity" in data
    assert "message" in data