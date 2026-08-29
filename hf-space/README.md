---
title: BG Remover Models
emoji: 🖼️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: mit
short_description: U2-Net, ISNet and BiRefNet background removal API
---

# BG Remover Models

FastAPI service for background removal using **U2-Net**, **ISNet**, **BiRefNet** and related rembg models.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Service info |
| GET | `/api/health` | Health check |
| GET | `/api/models` | List available models |
| POST | `/api/remove-background` | Remove background |

### POST `/api/remove-background`

Multipart form:

- `file` — image (required)
- `model` — one of: `u2net`, `u2netp`, `isnet-general-use`, `birefnet-general`, `silueta` (optional, default `u2net`)
- `alpha_matting` — `true` / `false` (optional)

Response: `image/png` with transparent background.

## Connect to the main app

After this Space is live, set on Vercel:

```
VITE_HF_SPACE_URL=https://YOUR_USERNAME-bg-remover-models.hf.space
```

Then redeploy the frontend.

## Deploy note

This folder is self-contained. When creating the Space:

1. New Space → **Docker** SDK
2. Upload / push **only** the files from this folder to the **root** of the Space repo:
   - `README.md` (this file)
   - `Dockerfile`
   - `app.py`
   - `requirements.txt`
