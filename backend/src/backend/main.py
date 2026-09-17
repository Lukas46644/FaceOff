import uuid
from pathlib import Path

import cv2
import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Project root is FaceOff/ (three levels up from this file: backend/src/backend/main.py)
UPLOAD_DIR = Path(__file__).resolve().parents[3] / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

FACE_CASCADE = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

app = FastAPI(title="FaceOff API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def pixelate_faces(image: np.ndarray, blocks: int = 12) -> tuple[np.ndarray, int]:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = FACE_CASCADE.detectMultiScale(
        gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
    )

    for (x, y, w, h) in faces:
        face = image[y : y + h, x : x + w]
        face = cv2.resize(face, (blocks, blocks), interpolation=cv2.INTER_LINEAR)
        face = cv2.resize(face, (w, h), interpolation=cv2.INTER_NEAREST)
        image[y : y + h, x : x + w] = face

    return image, len(faces)


@app.post("/upload")
async def upload_image(file: UploadFile = File(...)) -> dict[str, str | int]:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image uploads are allowed")

    raw_bytes = await file.read()
    image = cv2.imdecode(np.frombuffer(raw_bytes, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image")

    pixelated, face_count = pixelate_faces(image)

    suffix = Path(file.filename or "").suffix or ".jpg"
    result_filename = f"{uuid.uuid4().hex}{suffix}"
    dest = UPLOAD_DIR / result_filename

    ok, encoded = cv2.imencode(suffix, pixelated)
    if not ok:
        raise HTTPException(status_code=500, detail="Could not encode result image")
    dest.write_bytes(encoded.tobytes())

    return {"filename": result_filename, "faces_detected": face_count}
