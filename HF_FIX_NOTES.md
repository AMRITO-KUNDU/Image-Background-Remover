# HF ZeroGPU API Fix (applied)

## What changed

### `hf-space/app.py`
- Robust input handling (PIL / data-URL / FileData)
- `@spaces.GPU(duration=120)` for BiRefNet headroom
- Explicit `api_name="remove"` + `demo.queue()`
- Cleaner return of RGBA PNG

### `hf-space/requirements.txt`
- Pinned `gradio>=5.0.0,<6.0` for stable API schema on ZeroGPU

### `frontend/src/lib/hfSpaceApi.js`
- Proper SSE stream reader (waits for `event: complete`)
- Correct FileData → Blob conversion
- Clearer quota / submit errors
- Optional `VITE_HF_TOKEN` for higher ZeroGPU quota

## Deploy steps

1. **Sync Space**
   - Push this repo (or run GitHub Action `sync-hf-space.yml`)
   - Or manually upload `hf-space/*` to your Gradio Space root
   - Wait until Space status is **Running**

2. **Vercel env**
   ```
   VITE_HF_SPACE_URL=https://YOUR_USERNAME-YOUR_SPACE.hf.space
   VITE_HF_TOKEN=hf_...          # optional but recommended
   ```

3. Redeploy frontend.

4. Test with `u2net` first (fastest cold start).
