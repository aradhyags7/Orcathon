from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)

def test_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_root_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_cors_render_origin():
    # Verify that Render subdomains pass CORS origin checks
    response = client.options(
        "/api/health",
        headers={
            "Origin": "https://deceptitrace-frontend.onrender.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "https://deceptitrace-frontend.onrender.com"
