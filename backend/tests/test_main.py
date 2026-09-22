import io

import cv2
import numpy as np
from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def _make_jpeg_bytes(width: int = 64, height: int = 64) -> bytes:
    image = np.full((height, width, 3), 200, dtype=np.uint8)
    ok, encoded = cv2.imencode(".jpg", image)
    assert ok
    return encoded.tobytes()


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_upload_rejects_non_image() -> None:
    response = client.post(
        "/upload",
        files={"file": ("note.txt", io.BytesIO(b"hello"), "text/plain")},
    )
    assert response.status_code == 400


def test_upload_rejects_undecodable_image() -> None:
    response = client.post(
        "/upload",
        files={"file": ("broken.jpg", io.BytesIO(b"not an image"), "image/jpeg")},
    )
    assert response.status_code == 400


def test_upload_accepts_valid_image_with_no_faces() -> None:
    response = client.post(
        "/upload",
        files={"file": ("plain.jpg", io.BytesIO(_make_jpeg_bytes()), "image/jpeg")},
        data={"method": "pixelate", "intensity": "50", "shape": "square"},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["faces_detected"] == 0
    assert body["filename"].endswith(".jpg")


def test_upload_rejects_oversized_file(monkeypatch) -> None:
    monkeypatch.setattr("backend.main.MAX_UPLOAD_BYTES", 10)
    response = client.post(
        "/upload",
        files={"file": ("plain.jpg", io.BytesIO(_make_jpeg_bytes()), "image/jpeg")},
    )
    assert response.status_code == 413
