---
title: BG Remover Models
emoji: 🖼️
colorFrom: blue
colorTo: indigo
sdk: gradio
sdk_version: "5.0.0"
app_file: app.py
pinned: false
license: mit
short_description: U2-Net / ISNet / BiRefNet background removal
---

# BG Remover Models (Gradio)

Free-tier friendly **Gradio** Space (use **ZeroGPU** if your free account allows it).

## Models

- u2net, u2netp, isnet-general-use, birefnet-general, silueta

## API for the main app

This Space exposes a Gradio API. After deploy, set on Vercel:

```
VITE_HF_SPACE_URL=https://YOUR_USERNAME-bg-remover-models.hf.space
```

The frontend calls the Gradio predict endpoint.

## Deploy

1. Create a new Space → **Gradio** (not Docker).
2. If free account: choose **ZeroGPU** when available (up to 2 Spaces).
3. Put these files at the **Space root**:
   - `README.md` (this file)
   - `app.py`
   - `requirements.txt`
4. Or sync from GitHub with the workflow in `.github/workflows/sync-hf-space.yml`.
