# BG Remover — AI Image Background Remover

Remove image backgrounds instantly using AI models through a React + FastAPI app.

## Features

- **Docker-ready deployment** for Render or any container host
- **remove.bg API integration** as default for excellent quality results
- **Model Marketplace** to browse and download additional AI models
- **Render free-tier mode** that keeps only U2-Net enabled to avoid RAM/time-out failures
- **Alpha Matting** option for finer hair/fur edge detail
- **Side-by-side preview** and transparent PNG download

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `REMOVE_BG_API_KEY` | API key for remove.bg service | `""` | No (but recommended for best results) |
| `RENDER_FREE_TIER` | Enable Render free-tier optimizations | `"false"` | No |
| `ENABLE_HEAVY_MODELS` | Enable heavy models (ISNet, BiRefNet) | `"false"` | No |
| `MAX_UPLOAD_MB` | Maximum upload size in MB | `"20"` (or `"8"` on free tier) | No |
| `MODEL_CACHE_DIR` | Directory to cache downloaded models | `None` | No |
| `CORS_ORIGINS` | Comma-separated list of allowed CORS origins | `"*"` | No |

### Getting a remove.bg API Key

1. Visit [remove.bg](https://www.remove.bg/api)
2. Sign up for an account
3. Get your free API key from the dashboard
4. Set the `REMOVE_BG_API_KEY` environment variable

## Models and Render free tier guidance

| Model | Type | Free-tier default | Notes |
|-------|------|-------------------|-------|
| remove.bg | API | Enabled | Cloud-based service with excellent quality. Requires API key. |
| U2-Net | Local | Enabled | Best choice for Render free tier. Fast and CPU-friendly. |
| ISNet | Local | Disabled | Better quality, but can exceed free-tier memory/CPU limits. |
| BiRefNet | Local | Disabled | Best quality, but usually too heavy for free-tier containers. |
| U2-Net-P | Local | Available | Lightweight version with faster inference. |
| Silueta | Local | Available | Optimized for portrait and human silhouette extraction. |
| MODNet | Local | Available | Real-time portrait matting with good accuracy. |

### Model Marketplace

The app includes a model marketplace where you can:
- Browse available AI models with speed/accuracy ratings
- Download additional models on demand
- View model details including size and performance characteristics

If you are using Render free tier and see model download, memory, or timeout errors, keep `ENABLE_HEAVY_MODELS=false`, upload smaller images, and use U2-Net or remove.bg API. For higher quality local models, upgrade the Render plan and set `ENABLE_HEAVY_MODELS=true`.

## Project Structure

```
├── Dockerfile       # Builds frontend and runs FastAPI in one container
├── render.yaml      # Render Blueprint configuration
├── frontend/        # React + Vite UI
│   └── src/
│       ├── components/
│       │   ├── Marketplace.jsx   # Model marketplace interface
│       │   ├── ModelSelector.jsx # Model selection with marketplace button
│       │   └── ...
│       └── App.jsx
├── backend/         # Python FastAPI API
│   └── main.py      # API with remove.bg integration and marketplace endpoints
└── README.md
```

## Local development

**Backend:**
```bash
cd backend
# Set your remove.bg API key
export REMOVE_BG_API_KEY="your_api_key_here"
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
  -e REMOVE_BG_API_KEY="your_api_key_here" \
  -e RENDER_FREE_TIER=true \
  -e ENABLE_HEAVY_MODELS=false \
  -e MAX_UPLOAD_MB=8 \
  bg-remover
```

Open `http://localhost:8000`.

## Deploy on Render

1. Push this repository to GitHub.
2. In Render, choose **New +** → **Blueprint** and select the repository.
3. Add your `REMOVE_BG_API_KEY` as an environment variable in Render.
4. Render will read `render.yaml`, build the Docker image, and run the web service.
5. Keep these free-tier environment variables unless you upgrade:
   - `RENDER_FREE_TIER=true`
   - `ENABLE_HEAVY_MODELS=false`
   - `MAX_UPLOAD_MB=8`

### What to do about free-tier model errors

Render free instances have limited CPU/RAM and can spin down when idle. Large rembg models may fail during download or inference. Recommended options:

- Use **remove.bg API** for best quality without local resource constraints
- Use **U2-Net only** on the free tier for local processing
- Keep uploads small, ideally under **8 MB**
- Avoid enabling alpha matting for very large images because it adds processing cost
- If you need ISNet or BiRefNet, upgrade Render and set `ENABLE_HEAVY_MODELS=true`
- If cold starts are a problem, use a paid always-on instance or an external worker/queue

## API Endpoints

### GET /api/models
List available models including remove.bg and downloaded marketplace models.

### GET /api/marketplace
List all models available in the marketplace for download.

### POST /api/marketplace/{model_id}/download
Download and load a model from the marketplace.

### DELETE /api/marketplace/{model_id}
Remove a downloaded model from memory.

### POST /api/remove-background
Process an image with the specified model.
- `file`: Image file (required)
- `model`: Model ID (default: "remove.bg")
- `alpha_matting`: Enable alpha matting (default: false)

## Tech Stack

- **Frontend**: React, Vite
- **Backend**: Python, FastAPI, rembg, httpx
- **Deployment**: Docker, Render Blueprint
- **API Integration**: remove.bg
