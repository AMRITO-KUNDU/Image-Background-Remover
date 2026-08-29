# BG Remover — Professional Hybrid App

Clean architecture. No Render.

| Mode | Runs on | Cost |
|------|---------|------|
| **Browser (Fast & Free)** | User's device | Free forever |
| **remove.bg API** | Vercel Serverless | Free tier + API key |
| **U2-Net / ISNet / BiRefNet** | Hugging Face Spaces | Free (HF quotas) |

## Structure

```
Image-Background-Remover/
├── api/
│   └── remove-background.js   # Vercel → remove.bg proxy
├── frontend/                  # React app → Vercel
│   └── src/
│       ├── lib/               # clientSide, serverApi, hfSpaceApi
│       ├── hooks/             # useBackgroundRemoval
│       └── components/
├── hf-space/                  # U2-Net + heavy models → Hugging Face Spaces
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
├── package.json
├── vercel.json
└── README.md
```

## 1. Frontend + remove.bg (Vercel)

```bash
cd frontend
npm install
```

In Vercel project settings add:

```
REMOVE_BG_API_KEY=your_remove_bg_key
VITE_HF_SPACE_URL=https://YOUR_USERNAME-bg-remover-models.hf.space
```

Deploy the **repo root** (vercel.json handles build).

Local:

```bash
npm install          # root (formidable for API)
cd frontend && npm install && npm run dev
```

## 2. HF Space (U2-Net + heavy)

1. Create a new Space on Hugging Face → **Docker** SDK.
2. Connect this repository (or the `hf-space/` folder).
3. After it is live, copy the URL and set `VITE_HF_SPACE_URL` on Vercel.
4. Redeploy frontend.

The Space auto-rebuilds when you push changes under `hf-space/`.

## Models in the UI

- **Browser (Fast & Free)** — client-side ISNet (no server)
- **remove.bg API** — Vercel serverless → remove.bg
- **U2-Net / U2-Net-P / ISNet / BiRefNet / Silueta** — HF Space

## Environment variables

| Variable | Where | Required |
|----------|-------|----------|
| `REMOVE_BG_API_KEY` | Vercel | For remove.bg mode |
| `VITE_HF_SPACE_URL` | Vercel (frontend) | For HF models |

## License

Use freely. Check individual model licenses (especially BiRefNet / commercial use).
