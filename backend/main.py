from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from PIL import Image
import io

app = FastAPI(title="BG Remover API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPPORTED_MODELS = {
    "u2net": {
        "name": "U2-Net",
        "description": "Fast & lightweight. Best for quick results.",
        "speed": "Fast",
        "accuracy": "Good",
    },
    "isnet-general-use": {
        "name": "ISNet",
        "description": "Balanced speed and accuracy for general use.",
        "speed": "Medium",
        "accuracy": "High",
    },
    "birefnet-general": {
        "name": "BiRefNet",
        "description": "State-of-the-art accuracy. Best for fine details like hair.",
        "speed": "Slower",
        "accuracy": "Best",
    },
}

_sessions: dict = {}
_rembg = None


def get_rembg():
    global _rembg
    if _rembg is None:
        import rembg
        _rembg = rembg
    return _rembg


def get_session(model_name: str):
    if model_name not in _sessions:
        rembg = get_rembg()
        _sessions[model_name] = rembg.new_session(model_name)
    return _sessions[model_name]


@app.get("/")
async def root():
    return {"status": "ok", "service": "BG Remover API"}


@app.get("/api/models")
async def list_models():
    return {"models": SUPPORTED_MODELS}


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
    if len(contents) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Max 20MB.")

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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")
