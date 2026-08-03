from fastapi.testclient import TestClient

from techresumeai.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_enhance_bullet() -> None:
    response = client.post(
        "/api/resume/enhance",
        json={"bullet": "built internal tooling"},
    )
    assert response.status_code == 200
    assert response.json()["enhanced"] == "built internal tooling."


def test_index_returns_html() -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "TechResumeAI" in response.text
