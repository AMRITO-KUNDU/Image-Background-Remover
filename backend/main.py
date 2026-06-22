from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse
from fastapi.staticfiles import StaticFiles
import os

app = FastAPI(title="BG Remover API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in os.getenv("CORS_ORIGINS", "*").split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

RENDER_FREE_TIER = os.getenv("RENDER_FREE_TIER", "false").lower() == "true"
ENABLE_HEAVY_MODELS = os.getenv("ENABLE_HEAVY_MODELS", "false").lower() == "true"
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "8" if RENDER_FREE_TIER else "20"))
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR")

if MODEL_CACHE_DIR:
    os.environ.setdefault("U2NET_HOME", MODEL_CACHE_DIR)

SUPPORTED_MODELS = {
    "u2net": {
        "name": "U2-Net",
        "description": "Fastest CPU-friendly option. Recommended for Render free tier.",
        "speed": "Fast",
        "accuracy": "Good",
    },
    "isnet-general-use": {
        "name": "ISNet",
        "description": "Higher quality, but needs more RAM/CPU than free hosting usually provides.",
        "speed": "Medium",
        "accuracy": "High",
    },
    "birefnet-general": {
        "name": "BiRefNet",
        "description": "Best quality, but too heavy for most free-tier containers.",
        "speed": "Slower",
        "accuracy": "Best",
    },
}

HEAVY_MODELS = {"isnet-general-use", "birefnet-general"}
_sessions: dict = {}
_rembg = None


def available_models():
    if ENABLE_HEAVY_MODELS:
        return SUPPORTED_MODELS
    return {
        model_id: {
            **details,
            "enabled": model_id not in HEAVY_MODELS,
            "disabled_reason": "Disabled on the free tier to avoid memory/time-out errors. Upgrade Render or set ENABLE_HEAVY_MODELS=true."
            if model_id in HEAVY_MODELS
            else None,
        }
        for model_id, details in SUPPORTED_MODELS.items()
    }


def get_rembg():
    global _rembg
    if _rembg is None:
        import rembg

        _rembg = rembg
    return _rembg


def get_session(model_name: str):
    if model_name in HEAVY_MODELS and not ENABLE_HEAVY_MODELS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{SUPPORTED_MODELS[model_name]['name']} is disabled for this deployment. "
                "Use U2-Net on Render free tier, or upgrade your Render service and set ENABLE_HEAVY_MODELS=true."
            ),
        )
    if model_name not in _sessions:
        rembg = get_rembg()
        _sessions[model_name] = rembg.new_session(model_name)
    return _sessions[model_name]


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "free_tier_mode": RENDER_FREE_TIER,
        "heavy_models_enabled": ENABLE_HEAVY_MODELS,
        "max_upload_mb": MAX_UPLOAD_MB,
    }


@app.get("/api/models")
async def list_models():
    return {"models": available_models()}


@app.post("/api/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    model: str = Form(default="u2net"),
    alpha_matting: bool = Form(default=False),
):
    if model not in SUPPORTED_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model '{model}'. Choose from: {list(SUPPORTED_MODELS.keys())}",
        )

    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG, PNG, or WebP.",
        )

    contents = await file.read()
    if len(contents) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(status_code=400, detail=f"File too large. Max {MAX_UPLOAD_MB}MB.")

    try:
        rembg = get_rembg()
        session = get_session(model)
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
                "X-Model-Used": model,
            },
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


frontend_dist = Path(__file__).resolve().parents[1] / "frontend" / "dist"
if frontend_dist.exists():
    app.mount("/assets", StaticFiles(directory=frontend_dist / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        requested = frontend_dist / full_path
        if full_path and requested.is_file():
            return FileResponse(requested)
        return FileResponse(frontend_dist / "index.html")
else:
    @app.get("/")
    async def root():
        return {"status": "ok", "service": "BG Remover API", "docs": "/docs"}
