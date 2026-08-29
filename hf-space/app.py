"""
Gradio Space — U2-Net + heavy models via rembg.
Exposes UI + API for the Vercel frontend.
"""

import gradio as gr
from rembg import remove, new_session
from PIL import Image
import io

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


def remove_bg(image: Image.Image, model: str = "u2net", alpha_matting: bool = False):
    if image is None:
        return None
    model_name = model if model in MODELS else "u2net"
    session = get_session(model_name)

    buf = io.BytesIO()
    image.convert("RGB").save(buf, format="PNG")
    data = buf.getvalue()

    result = remove(
        data,
        session=session,
        alpha_matting=alpha_matting,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=10,
    )
    return Image.open(io.BytesIO(result)).convert("RGBA")


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
    description="U2-Net · ISNet · BiRefNet — used by the main Vercel app",
    api_name="remove",
)

if __name__ == "__main__":
    demo.launch()
