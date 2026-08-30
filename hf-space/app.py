"""
Gradio Space — background removal API for the Vercel frontend.
ZeroGPU compatible. Exposed as /gradio_api/call/remove
"""

import base64
import io
import gradio as gr
import spaces
from rembg import remove, new_session
from PIL import Image

MODELS = {
    "u2net": "U2-Net (fast)",
    "u2netp": "U2-Net-P (fastest)",
    "isnet-general-use": "ISNet (higher quality)",
    "birefnet-general": "BiRefNet (best edges)",
    "silueta": "Silueta (portraits)",
}

_sessions = {}


def get_session(model_name: str):
    if model_name not in _sessions:
        _sessions[model_name] = new_session(model_name)
    return _sessions[model_name]


def _to_pil(image) -> Image.Image:
    """Convert Gradio's image value into RGB PIL and preserve useful errors."""
    if image is None:
        raise ValueError("No image was received by the Hugging Face Space")
    if isinstance(image, Image.Image):
        return image.convert("RGB")
    if isinstance(image, dict):
        # Gradio FileData. In API calls, the image is normally already converted
        # to PIL by gr.Image(type="pil"), but this also handles raw FileData.
        path = image.get("path") or image.get("url") or image.get("name")
        if path and isinstance(path, str) and path.startswith("data:"):
            _, b64 = path.split(",", 1)
            return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
        if path:
            return Image.open(path).convert("RGB")
        raise ValueError("Image FileData did not contain a readable path or URL")
    if isinstance(image, str) and image.startswith("data:"):
        _, b64 = image.split(",", 1)
        return Image.open(io.BytesIO(base64.b64decode(b64))).convert("RGB")
    if isinstance(image, str):
        return Image.open(image).convert("RGB")
    return Image.fromarray(image).convert("RGB")


@spaces.GPU(duration=120)  # BiRefNet can be slow; 120s budget
def remove_bg(image, model: str = "u2net", alpha_matting: bool = False):
    """
    Core GPU function. Always returns a PIL RGBA image (or None).
    """
    pil = _to_pil(image)

    model_name = model if model in MODELS else "u2net"
    session = get_session(model_name)

    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    data = buf.getvalue()

    result_bytes = remove(
        data,
        session=session,
        alpha_matting=bool(alpha_matting),
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )
    return Image.open(io.BytesIO(result_bytes)).convert("RGBA")


# Explicit Interface so the endpoint name is stable: /remove
demo = gr.Interface(
    fn=remove_bg,
    inputs=[
        gr.Image(type="pil", label="Image"),
        gr.Dropdown(
            choices=list(MODELS.keys()),
            value="u2net",
            label="Model",
        ),
        gr.Checkbox(label="Alpha matting (finer hair edges)", value=False),
    ],
    outputs=gr.Image(type="pil", label="Result", format="png"),
    title="BG Remover Models",
    description="API endpoint used by the main Vercel app. UI is secondary.",
    api_name="remove",          # → /gradio_api/call/remove
    flagging_mode="never",
)

# Queue is required for ZeroGPU long jobs
demo.queue(max_size=20)

if __name__ == "__main__":
    demo.launch()
