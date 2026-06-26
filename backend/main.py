from pathlib import Path
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
import os
import httpx
import shutil
from typing import Dict, List, Optional
import json

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
REMOVE_BG_API_KEY = os.getenv("REMOVE_BG_API_KEY", "")

if MODEL_CACHE_DIR:
    os.environ.setdefault("U2NET_HOME", MODEL_CACHE_DIR)

# Create models directory for marketplace downloads
MODELS_DIR = Path(MODEL_CACHE_DIR) if MODEL_CACHE_DIR else Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

# Marketplace model registry - rembg library models
# u2net is the ONLY local model shown in the main UI (lightest: 176 MB, CPU-only friendly).
# All others live exclusively in the marketplace for users who want higher quality.
MARKETPLACE_MODELS = {
    "u2net": {
        "name": "U2-Net",
        "description": "Recommended for Render free tier (0.5 GB RAM). Fast, CPU-only, 176 MB.",
        "speed": "Fast",
        "accuracy": "Good",
        "size_mb": 176,
        "download_url": None,
        "type": "builtin"
    },
    "u2netp": {
        "name": "U2-Net-P",
        "description": "Ultra-lightweight U2-Net variant. Fastest inference, lower quality. 100 MB.",
        "speed": "Very Fast",
        "accuracy": "Medium",
        "size_mb": 100,
        "download_url": None,
        "type": "builtin"
    },
    "silueta": {
        "name": "Silueta",
        "description": "Optimised for portrait / human silhouette extraction. 50 MB.",
        "speed": "Fast",
        "accuracy": "Good",
        "size_mb": 50,
        "download_url": None,
        "type": "builtin"
    },
    "modnet": {
        "name": "MODNet",
        "description": "Real-time portrait matting. Requires ~300 MB RAM. 80 MB model.",
        "speed": "Very Fast",
        "accuracy": "Medium",
        "size_mb": 80,
        "download_url": None,
        "type": "builtin"
    },
    "isnet-general-use": {
        "name": "ISNet",
        "description": "Higher quality than U2-Net. Requires ~600 MB RAM \u2014 not suitable for free tier. 200 MB.",
        "speed": "Medium",
        "accuracy": "High",
        "size_mb": 200,
        "download_url": None,
        "type": "builtin"
    },
    "birefnet-general": {
        "name": "BiRefNet",
        "description": "State-of-the-art quality. Requires ~1.5 GB RAM \u2014 upgrade Render plan. 400 MB.",
        "speed": "Slower",
        "accuracy": "Best",
        "size_mb": 400,
        "download_url": None,
        "type": "builtin"
    },
}

SUPPORTED_MODELS = {
    "remove.bg": {
        "name": "remove.bg API",
        "description": "Cloud-based API service with excellent quality. Requires API key.",
        "speed": "Fast",
        "accuracy": "Excellent",
        "type": "api",
        "requires_api_key": True
    }
}

# Heavy models need >512 MB RAM — disabled on free tier by default
HEAVY_MODELS = {"isnet-general-use", "birefnet-general", "modnet"}
_sessions: dict = {}
_rembg = None


def available_models():
    models = {}

    # Always include remove.bg entry; disabled when no API key is set so the
    # frontend can show it greyed out with a helpful message.
    models["remove.bg"] = {
        **SUPPORTED_MODELS["remove.bg"],
        "enabled": bool(REMOVE_BG_API_KEY),
        "disabled_reason": None if REMOVE_BG_API_KEY else "Set REMOVE_BG_API_KEY to enable cloud processing.",
    }

    # u2net is always available — it is the recommended free-tier local model
    models["u2net"] = {
        **MARKETPLACE_MODELS["u2net"],
        "enabled": True,
    }

    # All remaining marketplace models are surfaced but may be disabled on free tier
    for model_id, details in MARKETPLACE_MODELS.items():
        if model_id == "u2net":
            continue  # already added above
        if model_id in HEAVY_MODELS and not ENABLE_HEAVY_MODELS:
            models[model_id] = {
                **details,
                "enabled": False,
                "disabled_reason": (
                    f"{details['name']} requires more RAM than the free tier provides. "
                    "Upgrade Render or set ENABLE_HEAVY_MODELS=true."
                ),
            }
        else:
            models[model_id] = {**details, "enabled": True}

    return models


def get_rembg():
    global _rembg
    if _rembg is None:
        import rembg
        _rembg = rembg
    return _rembg


def get_session(model_name: str):
    if model_name == "remove.bg":
        raise HTTPException(
            status_code=400,
            detail="remove.bg is an API service, not a local model session."
        )
    
    if model_name in HEAVY_MODELS and not ENABLE_HEAVY_MODELS:
        raise HTTPException(
            status_code=400,
            detail=(
                f"{MARKETPLACE_MODELS[model_name]['name']} is disabled for this deployment. "
                "Use U2-Net on Render free tier, or upgrade your Render service and set ENABLE_HEAVY_MODELS=true."
            ),
        )
    if model_name not in _sessions:
        rembg = get_rembg()
        _sessions[model_name] = rembg.new_session(model_name)
    return _sessions[model_name]


async def remove_background_api(file_bytes: bytes, filename: str):
    """Process image using remove.bg API"""
    if not REMOVE_BG_API_KEY:
        raise HTTPException(
            status_code=400,
            detail="REMOVE_BG_API_KEY environment variable is not set."
        )
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.remove.bg/v1.0/removebg",
            headers={"X-Api-Key": REMOVE_BG_API_KEY},
            files={"image_file": (filename, file_bytes, "image/jpeg")},
            data={"size": "auto"}
        )
        
        if response.status_code != 200:
            error_text = response.text
            raise HTTPException(
                status_code=response.status_code,
                detail=f"remove.bg API error: {error_text}"
            )
        
        return response.content


@app.get("/api/health")
async def health():
    return {
        "status": "ok",
        "free_tier_mode": RENDER_FREE_TIER,
        "heavy_models_enabled": ENABLE_HEAVY_MODELS,
        "max_upload_mb": MAX_UPLOAD_MB,
        "remove_bg_enabled": bool(REMOVE_BG_API_KEY)
    }


@app.get("/api/models")
async def list_models():
    return {"models": available_models()}


@app.get("/api/marketplace")
async def list_marketplace_models():
    """List all available models in the marketplace"""
    return {"models": MARKETPLACE_MODELS}


@app.post("/api/marketplace/{model_id}/download")
async def download_model(model_id: str):
    """Download a model from the marketplace"""
    if model_id not in MARKETPLACE_MODELS:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found in marketplace")
    
    model_info = MARKETPLACE_MODELS[model_id]
    
    if model_info["type"] == "builtin":
        # For built-in rembg models, we just trigger the download by loading it
        try:
            rembg = get_rembg()
            session = rembg.new_session(model_id)
            _sessions[model_id] = session
            return {
                "status": "success",
                "message": f"{model_info['name']} is now available",
                "model_id": model_id
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")
    
    return {"status": "success", "message": "Model downloaded successfully"}


@app.delete("/api/marketplace/{model_id}")
async def delete_model(model_id: str):
    """Delete a downloaded model from local storage"""
    if model_id not in MARKETPLACE_MODELS:
        raise HTTPException(status_code=404, detail=f"Model '{model_id}' not found")
    
    if model_id in _sessions:
        del _sessions[model_id]
    
    return {"status": "success", "message": f"Model {model_id} removed from memory"}


@app.post("/api/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    model: str = Form(default="remove.bg"),
    alpha_matting: bool = Form(default=False),
):
    # Handle remove.bg API
    if model == "remove.bg":
        if not REMOVE_BG_API_KEY:
            raise HTTPException(
                status_code=400,
                detail="REMOVE_BG_API_KEY environment variable is not set. Please configure it to use remove.bg API."
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
            result = await remove_background_api(contents, file.filename)
            return Response(
                content=result,
                media_type="image/png",
                headers={
                    "Content-Disposition": "attachment; filename=removed_bg.png",
                    "X-Model-Used": "remove.bg",
                },
            )
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
    
    # Handle local rembg models
    if model not in MARKETPLACE_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported model '{model}'. Choose from: {list(MARKETPLACE_MODELS.keys())}",
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
