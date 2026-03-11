from fastapi.testclient import TestClient # type: ignore
from app.main import app

client = TestClient(app)


def get_token(role):
    res = client.post(
        "/auth/login",
        json={"email": f"{role}@test.com", "role": role},
    )
    return res.json()["access_token"]


def test_admin_access_allowed():
    admin_token = get_token("admin")

    response = client.get(
        "/admin/vehicles",
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    assert response.status_code == 200


def test_admin_access_denied_for_user():
    user_token = get_token("user")

    response = client.get(
        "/admin/vehicles",
        headers={"Authorization": f"Bearer {user_token}"},
    )

    assert response.status_code == 403