import uuid
from pathlib import Path
from typing import Literal

import cv2
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Project root is FaceOff/ (three levels up from this file: backend/src/backend/main.py)
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

Method = Literal["pixelate", "blur", "darken"]
Shape = Literal["circle", "square"]

app = FastAPI(title="FaceOff API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def _shape_mask(w: int, h: int, shape: Shape) -> np.ndarray:
    if shape == "square":
        return np.full((h, w), 255, dtype=np.uint8)

    mask = np.zeros((h, w), dtype=np.uint8)
    cv2.circle(mask, (w // 2, h // 2), min(w, h) // 2, 255, -1)
    return mask


def _apply_effect(region: np.ndarray, method: Method, intensity: int) -> np.ndarray:
    intensity = max(0, min(100, intensity))
    h, w = region.shape[:2]

    if method == "blur":
        k = max(3, int(min(w, h) * (intensity / 100)))
        k += 1 - (k % 2)  # kernel size must be odd
        return cv2.GaussianBlur(region, (k, k), 0)

    if method == "darken":
        factor = intensity / 100
        return (region.astype(np.float32) * (1 - factor)).astype(np.uint8)

    # pixelate: higher intensity -> fewer blocks -> blockier result
    blocks = max(2, round(24 - (intensity / 100) * 20))
    small = cv2.resize(region, (blocks, blocks), interpolation=cv2.INTER_LINEAR)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_NEAREST)


def anonymize_faces(
    image: np.ndarray, method: Method, intensity: int, shape: Shape
) -> tuple[np.ndarray, int]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )

    for (x, y, w, h) in faces:
        region = image[y : y + h, x : x + w]
        effect = _apply_effect(region, method, intensity)
        mask = cv2.merge([_shape_mask(w, h, shape)] * 3)
        image[y : y + h, x : x + w] = np.where(mask == 255, effect, region)

    return image, len(faces)


@app.post("/upload")
async def upload_image(
    file: UploadFile = File(...),
    method: Method = Form("pixelate"),
    intensity: int = Form(50),
    shape: Shape = Form("square"),
) -> dict[str, str | int]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    raw_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(raw_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    result, face_count = anonymize_faces(image, method, intensity, shape)

    suffix = Path(file.filename or "").suffix or ".jpg"
    result_filename = f"{uuid.uuid4().hex}{suffix}"
    dest = UPLOAD_DIR / result_filename

    ok, encoded = cv2.imencode(suffix, result)
    if not ok:
        raise HTTPException(status_code=500, detail="Could not encode result image")
    dest.write_bytes(encoded.tobytes())

    return {"filename": result_filename, "faces_detected": face_count}
