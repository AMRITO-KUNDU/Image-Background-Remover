# BG Remover — Professional Hybrid App

| Mode | Platform | Cost |
|------|----------|------|
| **Browser (Fast & Free)** | User device | Free |
| **remove.bg API** | Vercel Serverless | Free tier + API key |
| **U2-Net / ISNet / BiRefNet** | Hugging Face Spaces | Free (HF quotas) |

## Structure

```
Image-Background-Remover/
├── frontend/                    ← Vercel Root Directory = frontend
│   ├── api/
│   │   └── remove-background.js → remove.bg proxy
│   ├── src/
│   ├── package.json
│   └── vercel.json
├── hf-space/                    ← Hugging Face Spaces only
│   ├── README.md
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── package.json
└── README.md
```

## Vercel setup (important)

1. **Root Directory** = `frontend`  ✅ (you already set this)
2. Environment variables:
   - `REMOVE_BG_API_KEY` = your remove.bg key
   - `VITE_HF_SPACE_URL` = `https://YOUR_USERNAME-xxx.hf.space`
3. Redeploy

Install/build run inside `frontend/`, so the API lives at `frontend/api/`.

## Hugging Face Space

Do **not** point the Space at the whole repo.

Create a new **Docker** Space and put **only** these at the Space root:

- `hf-space/README.md`
- `hf-space/Dockerfile`
- `hf-space/app.py`
- `hf-space/requirements.txt`

## Local

```bash
cd frontend
npm install
npm run dev
```
