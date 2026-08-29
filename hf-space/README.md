---
title: BG Remover Models
emoji: 🖼️
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# BG Remover — U2-Net + Heavy Models

Runs **U2-Net**, **ISNet**, **BiRefNet** and other rembg models.

## Endpoints

- `GET /api/health`
- `GET /api/models`
- `POST /api/remove-background`  
  multipart: `file`, `model` (optional), `alpha_matting` (optional) → PNG

## Connect to frontend

After the Space is live, set on Vercel:

```
VITE_HF_SPACE_URL=https://YOUR_USERNAME-bg-remover-models.hf.space
```

## Auto-deploy

Connect this repo (or the `hf-space/` folder) to the Space.  
Pushes that change `hf-space/` will rebuild automatically.
