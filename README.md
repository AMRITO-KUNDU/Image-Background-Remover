# BG Remover — Professional Hybrid App

Monorepo architecture (no Render).

| Mode | Platform | Cost |
|------|----------|------|
| **Browser (Fast & Free)** | User device | Free |
| **remove.bg API** | Vercel Serverless | Free tier + API key |
| **U2-Net / ISNet / BiRefNet** | Hugging Face Spaces | Free (HF quotas) |

## Structure

```
Image-Background-Remover/
├── api/
│   └── remove-background.js   → Vercel (remove.bg proxy)
├── frontend/                  → Vercel (React UI)
│   └── src/
│       ├── lib/               clientSideRemover, serverApi, hfSpaceApi
│       ├── hooks/             useBackgroundRemoval
│       └── components/
├── hf-space/                  → Hugging Face Spaces ONLY
│   ├── README.md              ← YAML frontmatter (HF rules compliant)
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── package.json
├── vercel.json
└── README.md
```

## Deploy Vercel

1. Import this **whole repo** on Vercel.
2. Environment variables:
   - `REMOVE_BG_API_KEY` = your remove.bg key
   - `VITE_HF_SPACE_URL` = `https://YOUR_USERNAME-xxx.hf.space` (after HF is live)
3. Deploy (uses `vercel.json`).

## Deploy Hugging Face Space (important)

**Do not** point the Space at the whole monorepo.

HF requires `README.md` with YAML at the **root of the Space**.

### Correct method

1. Create a **new Space** → SDK = **Docker**.
2. Put **only** the contents of `hf-space/` at the **root** of that Space:

```
Space root/
├── README.md      ← copy from hf-space/README.md
├── Dockerfile
├── app.py
└── requirements.txt
```

3. After it is live, copy the Space URL and set `VITE_HF_SPACE_URL` on Vercel, then redeploy.

The YAML in `hf-space/README.md` already follows HF rules (`sdk: docker`, `app_port: 7860`, allowed colors, etc.).

## Local development

```bash
# Root (for Vercel API dependency)
npm install

# Frontend
cd frontend
npm install
npm run dev
```

Browser mode works without any backend.  
remove.bg needs `REMOVE_BG_API_KEY`.  
HF models need `VITE_HF_SPACE_URL`.

## Models in the UI

- **Browser (Fast & Free)** — client-side
- **remove.bg API** — Vercel → remove.bg
- **U2-Net, U2-Net-P, ISNet, BiRefNet, Silueta** — HF Space
