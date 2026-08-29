# BG Remover — Professional Hybrid App

| Mode | Platform | Cost |
|------|----------|------|
| **Browser (Fast & Free)** | User device | Free forever |
| **remove.bg API** | Vercel Serverless | Free tier + API key |
| **U2-Net / ISNet / BiRefNet** | Hugging Face **Gradio** Space | Free if ZeroGPU allowed (else needs PRO) |

## Why Gradio (not Docker)?

As of 2026, **Docker Spaces require a paid plan**.  
**Static** is free but cannot run Python models.  
**Gradio** on **ZeroGPU** can still be free for eligible personal accounts (up to 2 Spaces).

## Structure

```
├── frontend/                 ← Vercel Root Directory = frontend
│   ├── api/remove-background.js
│   └── src/
├── hf-space/                 ← Gradio Space (not Docker)
│   ├── README.md             (sdk: gradio)
│   ├── app.py
│   └── requirements.txt
├── .github/workflows/
│   └── sync-hf-space.yml     ← push hf-space/ → HF on every commit
└── vercel.json
```

## Vercel

- **Root Directory** = `frontend`
- Env:
  - `REMOVE_BG_API_KEY`
  - `VITE_HF_SPACE_URL` = `https://USERNAME-SPACE.hf.space`

## Hugging Face Space (manual or Actions)

### Option A — Manual (simplest)

1. Create Space → SDK **Gradio** (try ZeroGPU if free account shows it).
2. Upload files from `hf-space/` to the Space root.
3. Copy Space URL → Vercel env `VITE_HF_SPACE_URL`.

### Option B — Auto-sync from GitHub

1. Create empty Gradio Space on HF.
2. GitHub repo → Settings → Secrets → `HF_TOKEN` (write token from https://huggingface.co/settings/tokens).
3. Settings → Variables:
   - `HF_USERNAME` = your HF username  
   - `HF_SPACE_NAME` = your Space name  
4. Push to `main` (or run workflow manually). The action uploads `hf-space/` to the Space.

There is **no** built-in one-click GitHub link for free Spaces; GitHub Actions + token is the standard way.

## If HF free tier blocks you

- Rely on **Browser** mode (already unlimited/free).
- Use **remove.bg** for highest quality cloud.
- Or upgrade HF PRO (~$9/mo) for Docker/Gradio CPU Spaces.
