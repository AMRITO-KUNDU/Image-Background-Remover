"""
Hugging Face Space — U2-Net + Heavy models (BiRefNet, ISNet, etc.)
API compatible with the frontend:

  GET  /api/models
  GET  /api/health
  POST /api/remove-background
       multipart: file, model (optional), alpha_matting (optional)
       → image/png
"""

import os
from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response

app = FastAPI(title="BG Remover Models (HF Space)", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "20"))
DEFAULT_MODEL = os.getenv("DEFAULT_MODEL", "u2net")

# Models available on this Space
MODELS = {
    "u2net": {
        "name": "U2-Net",
        "description": "Fast general-purpose model. Good balance of speed and quality.",
        "speed": "Fast",
        "accuracy": "Good",
        "size_mb": 176,
    },
    "u2netp": {
        "name": "U2-Net-P",
        "description": "Lightweight U2-Net. Fastest inference, slightly lower quality.",
        "speed": "Very Fast",
        "accuracy": "Medium",
        "size_mb": 100,
    },
    "isnet-general-use": {
        "name": "ISNet",
        "description": "Higher quality than U2-Net. Excellent general use.",
        "speed": "Medium",
        "accuracy": "High",
        "size_mb": 200,
    },
    "birefnet-general": {
        "name": "BiRefNet",
        "description": "State-of-the-art edges (hair, fur, fine detail).",
        "speed": "Slower",
        "accuracy": "Best",
        "size_mb": 400,
    },
    "silueta": {
        "name": "Silueta",
        "description": "Optimised for human / portrait silhouettes.",
        "speed": "Fast",
        "accuracy": "Good",
        "size_mb": 50,
    },
}

_sessions = {}
_rembg = None


def get_rembg():
    global _rembg
    if _rembg is None:
        import rembg
        _rembg = rembg
    return _rembg


def get_session(model_name: str):
    if model_name not in MODELS:
        raise HTTPException(status_code=400, detail=f"Unknown model '{model_name}'. Choose from: {list(MODELS.keys())}")
    if model_name not in _sessions:
        rembg = get_rembg()
        _sessions[model_name] = rembg.new_session(model_name)
    return _sessions[model_name]


@app.get("/")
async def root():
    return {
        "service": "BG Remover Models",
        "default_model": DEFAULT_MODEL,
        "models": list(MODELS.keys()),
        "docs": "/docs",
    }


@app.get("/api/health")
async def health():
    return {"status": "ok", "default_model": DEFAULT_MODEL, "models": list(MODELS.keys())}


@app.get("/api/models")
async def list_models():
    return {
        "models": {
            mid: {**info, "enabled": True, "type": "local"}
            for mid, info in MODELS.items()
        }
    }


@app.post("/api/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    model: str = Form(default=None),
    alpha_matting: bool = Form(default=False),
):
    model_name = model or DEFAULT_MODEL
    if model_name not in MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model '{model_name}'. Available: {list(MODELS.keys())}",
        )

    allowed = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, or WebP.",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_UPLOAD_MB}MB.")

    try:
        rembg = get_rembg()
        session = get_session(model_name)
        result = rembg.remove(
            contents,
            session=session,
            alpha_matting=alpha_matting,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=10,
        )
        return Response(
            content=result,
            media_type="image/png",
            headers={
                "Content-Disposition": "attachment; filename=removed_bg.png",
                "X-Model-Used": model_name,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
