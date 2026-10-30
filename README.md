<div align="center">

  <h1>LuminaBG</h1>

  <b>Remove backgrounds with the right model for the job</b><br/>
  instant and private in your browser, sharpest in the cloud, most powerful on GPU.

  <br/><br/>

  <a href="https://image-background-remover-lake.vercel.app/"><img alt="Live Demo" src="https://img.shields.io/badge/Live_Demo-open-brightgreen?style=for-the-badge&logo=vercel&logoColor=white"></a>
  <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white">
  <img alt="Vite 6" src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white">
  <img alt="ZeroGPU" src="https://img.shields.io/badge/Hugging_Face-ZeroGPU-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black">

  <br/><br/>

  <a href="https://image-background-remover-lake.vercel.app/"><b>▶ Try LuminaBG</b></a>
</div>

---

## 🎯 The problem

Background removal looks like a solved problem until you actually need it.

The best-quality model is slow. The fastest one mangles hair. Most tools quietly upload your image to somebody else's server to do the work — even when a quick pass in the browser would have been enough. And almost every tool makes the choice **for** you, then hides it behind a single "Remove background" button.

So you inherit whichever trade-off the developer picked: privacy, speed, or quality. Never all three.

**LuminaBG refuses to make that choice for you.**

---

## ✨ The solution

### 1️⃣ **Pick the engine, per image**

Seven engines sit behind one interface. A model selector shows the speed and quality of each, so you choose with your eyes open — not by guessing.

### 2️⃣ **Watch it work, side by side**

A draggable before/after slider plus Result and Original tabs. No reloading, no downloading something just to find out it was wrong.

### 3️⃣ **Export exactly what you need**

A transparent PNG, or the cutout composited onto eight solid colours — rendered on a canvas at full resolution.

One clean interface. Three ways to run. No lock-in.

---

## 🌟 Key features

### 🔒 **Privacy where it matters**

The **Browser engine** runs an ONNX model entirely on your device. Your image never leaves the tab. Nothing is uploaded, nothing is stored.

### 🧩 **No vendor lock-in**

Mix a free local model, a paid cloud API, and open-source GPU models in the same session. Switch mid-project without switching tools.

### 🎯 **Built for hard edges**

Optional **alpha matting** (foreground `240` / background `10` / erode `10`) recovers hair, fur and fine detail — the exact thing most background removers smear into a halo.

### 🖼️ **Ship-ready output**

Transparent PNG, or composite onto white, black, gray, blue, green, red, yellow or purple. Rendered at full resolution on a canvas, not a downscaled preview.

### ⚡ **Fast by default**

Drag-and-drop upload for JPEG, PNG, WebP and GIF up to 20 MB. Dark/light theme that remembers your choice. One-click download.

---

## 🧠 The model lineup

| Model | Engine | Runs on | Speed | Quality |
|---|---|:---|:---:|:---:|
| **Browser (Fast & Free)** | `@imgly/background-removal` (`isnet_quint8`) | Your device (WASM/ONNX) | 95 | 78 |
| **remove.bg API** | remove.bg cloud | Vercel serverless proxy | 90 | 100 |
| **U2-Net** | `rembg` | Hugging Face ZeroGPU | 85 | 72 |
| **U2-Net-P** | `rembg` | Hugging Face ZeroGPU | 95 | 60 |
| **ISNet** | `rembg` | Hugging Face ZeroGPU | 70 | 88 |
| **BiRefNet** | `rembg` | Hugging Face ZeroGPU | 50 | 96 |
| **Silueta** | `rembg` | Hugging Face ZeroGPU | 88 | 75 |

> Speed and quality are LuminaBG's **own in-app scores**, tuned for at-a-glance comparison — not published benchmarks. They describe relative feel, not absolute accuracy.

---

## 🏗️ How it works

```
                 ┌────────────────────────────────────────────┐
                 │   Browser — React 19 + Vite (Vercel)       │
                 │   Model selector · compare slider · export │
                 └───────────────┬────────────────────────────┘
                                 │  pick a model
        ┌────────────────────────┼────────────────────────────┐
        ▼                        ▼                            ▼
┌────────────────┐    ┌────────────────────┐    ┌────────────────────────────┐
│ Browser engine │    │ Cloud engine       │    │ GPU engine                 │
│ @imgly/        │    │ /api/remove-       │    │ Gradio Space (ZeroGPU)     │
│ background-    │    │ background         │    │ /gradio_api/call/remove    │
│ removal        │    │ (Vercel serverless)│    │ rembg + onnxruntime        │
│ on-device,     │    │ → remove.bg        │    │ u2net · u2netp · isnet ·   │
│ no upload      │    │ needs API key      │    │ birefnet · silueta         │
└────────────────┘    └────────────────────┘    └────────────────────────────┘
```

- **Browser engine** — `@imgly/background-removal` runs an ONNX model in the tab. Free, instant, private.
- **Cloud engine** — a Vercel serverless function (`formidable` multipart, 20 MB cap) proxies to remove.bg and streams back a PNG.
- **GPU engine** — a Gradio Space exposes a single `remove` endpoint. The frontend submits the image, then reads the result from Gradio's SSE stream (`event: complete`) and converts it to a Blob.

---

## ⚖️ LuminaBG vs the alternatives

| | LuminaBG | Typical "remove bg" site | One-model local tool |
|---|:---:|:---:|:---:|
| Choose the model per image | ✅ | ❌ | ❌ |
| Works with zero upload | ✅ | ❌ | ✅ |
| Reaches cloud quality when needed | ✅ | ✅ | ❌ |
| Free to run | ✅ | ⚠️ paid/watermarked | ✅ |
| See speed vs quality before choosing | ✅ | ❌ | ❌ |

---

## 🚀 Quick start

**Requirements:** Node 18+ and npm.

```bash
git clone https://github.com/AMRITO-KUNDU/Image-Background-Remover.git
cd Image-Background-Remover

npm install          # installs the frontend workspace
npm run dev          # → http://localhost:5000
```

The **Browser engine works with zero configuration**. To unlock the cloud and GPU engines, add the environment variables below.

```bash
cp .env.example .env
```

---

## 🔐 Environment variables

| Variable | Where | Required | Purpose |
|---|---|:---:|---|
| `VITE_HF_SPACE_URL` | Frontend | optional | Base URL of your Gradio Space, e.g. `https://your-space.hf.space` (no trailing slash). Unlocks U2-Net / ISNet / BiRefNet / Silueta. |
| `VITE_HF_TOKEN` | Frontend | optional | Hugging Face token for higher ZeroGPU quota. |
| `REMOVE_BG_API_KEY` | Vercel | optional | Enables the remove.bg cloud engine. |

> Without any of these, LuminaBG still runs — the free, private Browser engine is always available.

---

## ☁️ Deploy

**Frontend (Vercel).** Set the project **Root Directory to `frontend`**. Add the env vars above, then deploy. The serverless remove.bg proxy lives at `api/remove-background.js`.

**Models (Hugging Face Space).** Create a Space with the **Gradio** SDK (ZeroGPU on a free account if available) and place `hf-space/app.py`, `hf-space/requirements.txt` and `hf-space/README.md` at the Space root. Copy the Space URL into `VITE_HF_SPACE_URL`.

**Auto-sync (optional).** `.github/workflows/sync-hf-space.yml` pushes `hf-space/` to your Space on every commit. Set the repo secret `HF_TOKEN` and the variables `HF_USERNAME` / `HF_SPACE_NAME`.

---

## 🛠️ Tech stack

**Frontend** — React 19 · Vite 6 · `@imgly/background-removal` · Material Icons Round · Inter / Outfit
**Serverless** — Node.js · `formidable` · Vercel Functions
**Models** — Gradio · `rembg` · `onnxruntime` · Pillow · Hugging Face ZeroGPU
**CI/CD** — GitHub Actions (HF Space sync) · Vercel

---

## 📁 Project structure

```
Image-Background-Remover/
├── frontend/                 # React app (Vercel Root Directory)
│   ├── api/                  # remove.bg serverless proxy
│   └── src/
│       ├── components/       # Header · ModelSelector · UploadZone · ResultPanel · Footer
│       ├── hooks/            # useBackgroundRemoval — one API, three engines
│       └── lib/              # clientSideRemover · serverApi · hfSpaceApi
├── hf-space/                 # Gradio Space (rembg models, ZeroGPU)
│   ├── app.py
│   └── requirements.txt
├── .github/workflows/        # sync-hf-space.yml
├── assets/                   # banner + brand assets
└── vercel.json
```

---

## 🗺️ Roadmap

**Working today**

- [x] Seven engines across browser, cloud and GPU
- [x] Per-image model selector with speed/quality bars
- [x] Before/after compare slider
- [x] Alpha matting for hair and fur
- [x] Transparent PNG and 8 background presets
- [x] Dark/light theme

**Not built yet**

- [ ] Batch / multi-image processing
- [ ] Additional export formats (WebP, JPEG with quality control)
- [ ] Wiring the model marketplace to a live catalogue
- [ ] Per-model presets and saved defaults

---

## 💭 FAQ

**Do I need an API key to use it?**
No. The Browser engine is free and unlimited. Keys only unlock the cloud and GPU engines.

**Does my image get uploaded?**
Only if you pick a cloud or GPU engine. The Browser engine runs entirely on your device.

**Why seven models instead of one?**
Because "best" depends on the image. A product shot wants BiRefNet; a quick draft wants the browser engine; a batch job might want remove.bg. LuminaBG lets the image decide.

**Is it really free?**
The app is MIT-licensed and self-hostable. The browser engine costs nothing to run. remove.bg is paid and entirely optional.

---

## 🙏 Credits

Built by **[Amrito Kundu](https://github.com/AMRITO-KUNDU)**.

Background removal powered by **[rembg](https://github.com/danielgatis/rembg)**, **[@imgly/background-removal](https://github.com/imgly/background-removal-js)**, **[remove.bg](https://www.remove.bg/)**, and **Hugging Face Gradio / ZeroGPU**.

## 📄 License

Released under the **MIT License** — see [LICENSE](LICENSE).
