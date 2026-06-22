# BG Remover — AI Image Background Remover

Remove image backgrounds instantly using AI models through a React + FastAPI app.

## Features

- **Docker-ready deployment** for Render or any container host
- **Render free-tier mode** that keeps only U2-Net enabled to avoid RAM/time-out failures
- **Alpha Matting** option for finer hair/fur edge detail
- **Side-by-side preview** and transparent PNG download

## Models and Render free tier guidance

| Model | Free-tier default | Notes |
|-------|-------------------|-------|
| U2-Net | Enabled | Best choice for Render free tier. It is the fastest and most CPU-friendly model. |
| ISNet | Disabled | Better quality, but it can exceed free-tier memory/CPU limits. Enable only on a larger instance. |
| BiRefNet | Disabled | Best quality, but it is usually too heavy for free-tier containers. Enable only on a paid instance. |

If you are using Render free tier and see model download, memory, or timeout errors, keep `ENABLE_HEAVY_MODELS=false`, upload smaller images, and use U2-Net. For higher quality models, upgrade the Render plan and set `ENABLE_HEAVY_MODELS=true`.

## Project Structure

```
├── Dockerfile       # Builds frontend and runs FastAPI in one container
├── render.yaml      # Render Blueprint configuration
├── frontend/        # React + Vite UI
├── backend/         # Python FastAPI API
└── README.md
```

## Local development

**Backend:**
```bash
cd backend
uvicorn main:app --reload --host localhost --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Run with Docker

```bash
docker build -t bg-remover .
docker run --rm -p 8000:8000 \
  -e RENDER_FREE_TIER=true \
  -e ENABLE_HEAVY_MODELS=false \
  -e MAX_UPLOAD_MB=8 \
  bg-remover
```

Open `http://localhost:8000`.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New +** → **Blueprint** and select the repository.
3. Render will read `render.yaml`, build the Docker image, and run the web service.
4. Keep these free-tier environment variables unless you upgrade:
   - `RENDER_FREE_TIER=true`
   - `ENABLE_HEAVY_MODELS=false`
   - `MAX_UPLOAD_MB=8`

### What to do about free-tier model errors

Render free instances have limited CPU/RAM and can spin down when idle. Large rembg models may fail during download or inference. Recommended options:

- Use **U2-Net only** on the free tier.
- Keep uploads small, ideally under **8 MB**.
- Avoid enabling alpha matting for very large images because it adds processing cost.
- If you need ISNet or BiRefNet, upgrade Render and set `ENABLE_HEAVY_MODELS=true`.
- If cold starts are a problem, use a paid always-on instance or an external worker/queue.

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Python, FastAPI, rembg
- **Deployment**: Docker, Render Blueprint
