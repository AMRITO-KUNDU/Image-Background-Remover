/**
 * Calls Hugging Face Gradio Space (ZeroGPU) for U2-Net / ISNet / BiRefNet / etc.
 *
 * Env: VITE_HF_SPACE_URL  (no trailing slash)
 *      e.g. https://USERNAME-bg-remover-models.hf.space
 *
 * Optional: VITE_HF_TOKEN  (gives higher ZeroGPU quota)
 *
 * Uses Gradio's queue API:
 *   POST /gradio_api/call/remove → { event_id }
 *   GET  /gradio_api/call/remove/{event_id} → SSE stream
 */

const HF_SPACE_URL = (import.meta.env.VITE_HF_SPACE_URL || '').replace(/\/$/, '')
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN || ''

export const HF_MODELS = {
  u2net: {
    id: 'u2net',
    name: 'U2-Net',
    badge: 'HF',
    description: 'Fast general model on Hugging Face',
    icon: 'memory',
  },
  u2netp: {
    id: 'u2netp',
    name: 'U2-Net-P',
    badge: 'HF',
    description: 'Lightweight & very fast',
    icon: 'memory',
  },
  'isnet-general-use': {
    id: 'isnet-general-use',
    name: 'ISNet',
    badge: 'HF',
    description: 'Higher quality general model',
    icon: 'auto_awesome',
  },
  'birefnet-general': {
    id: 'birefnet-general',
    name: 'BiRefNet',
    badge: 'Heavy',
    description: 'Best open-source edges (hair, fur)',
    icon: 'auto_awesome',
  },
  silueta: {
    id: 'silueta',
    name: 'Silueta',
    badge: 'HF',
    description: 'Portrait / human silhouette focused',
    icon: 'person',
  },
}

export function isHfModel(id) {
  return Boolean(HF_MODELS[id])
}

export function getHfModelList() {
  if (!HF_SPACE_URL) {
    return Object.values(HF_MODELS).map((m) => ({
      ...m,
      enabled: false,
      disabledReason: 'Set VITE_HF_SPACE_URL to enable HF models',
    }))
  }
  return Object.values(HF_MODELS).map((m) => ({ ...m, enabled: true }))
}

function authHeaders() {
  const h = { 'Content-Type': 'application/json' }
  if (HF_TOKEN) h['Authorization'] = `Bearer ${HF_TOKEN}`
  return h
}

async function fileToDataUrl(file) {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const b64 = btoa(binary)
  const mime = file.type || 'image/png'
  return `data:${mime};base64,${b64}`
}

/**
 * Parse Gradio SSE stream until event: complete | error
 * Returns the final data array (or throws).
 */
async function readSseResult(url) {
  const res = await fetch(url, { headers: authHeaders() })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`HF Space poll failed: ${res.status} ${t.slice(0, 200)}`)
  }

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''
  let currentEvent = null

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    const parts = buffer.split('\n')
    buffer = parts.pop() || '' // keep incomplete line

    for (const raw of parts) {
      const line = raw.replace(/\r$/, '')
      if (line.startsWith('event:')) {
        currentEvent = line.slice(6).trim()
      } else if (line.startsWith('data:')) {
        const payloadStr = line.slice(5).trim()
        if (!payloadStr) continue

        let payload
        try {
          payload = JSON.parse(payloadStr)
        } catch {
          continue
        }

        if (currentEvent === 'complete') {
          // payload is the data array, e.g. [ FileData | string | null ]
          return payload
        }
        if (currentEvent === 'error') {
          const msg =
            typeof payload === 'string'
              ? payload
              : payload?.error || payload?.message || JSON.stringify(payload)
          throw new Error(`HF Space error: ${msg}`)
        }
        // generating / heartbeat / status → ignore
      }
    }
  }

  throw new Error('HF Space stream ended without a complete event')
}

/**
 * Turn Gradio output (FileData dict, data-URL, path, or absolute URL) into a Blob
 */
async function outputToBlob(out) {
  if (!out) throw new Error('HF Space returned empty output')

  // Case 1: data URL string
  if (typeof out === 'string' && out.startsWith('data:')) {
    const res = await fetch(out)
    return res.blob()
  }

  // Case 2: absolute or relative URL string
  if (typeof out === 'string' && (out.startsWith('http') || out.startsWith('/'))) {
    const url = out.startsWith('http') ? out : `${HF_SPACE_URL}${out}`
    const res = await fetch(url, { headers: HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {} })
    if (!res.ok) throw new Error(`Failed to download HF result: ${res.status}`)
    return res.blob()
  }

  // Case 3: Gradio FileData object
  if (typeof out === 'object') {
    // Prefer the public url Gradio gives us
    if (out.url) {
      const url = out.url.startsWith('http') ? out.url : `${HF_SPACE_URL}${out.url}`
      const res = await fetch(url, { headers: HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {} })
      if (res.ok) return res.blob()
    }

    // Fallback: path → /gradio_api/file=...
    if (out.path) {
      const candidates = [
        `${HF_SPACE_URL}/gradio_api/file=${encodeURIComponent(out.path)}`,
        `${HF_SPACE_URL}/file=${encodeURIComponent(out.path)}`,
        out.path.startsWith('http') ? out.path : null,
      ].filter(Boolean)

      for (const url of candidates) {
        try {
          const res = await fetch(url, {
            headers: HF_TOKEN ? { Authorization: `Bearer ${HF_TOKEN}` } : {},
          })
          if (res.ok) return res.blob()
        } catch {
          // try next
        }
      }
    }
  }

  throw new Error('Unexpected HF Space output format: ' + JSON.stringify(out).slice(0, 300))
}

/**
 * Main entry — call from useBackgroundRemoval
 */
export async function removeBackgroundHF(
  imageFile,
  { model = 'u2net', alphaMatting = false } = {}
) {
  if (!HF_SPACE_URL) {
    throw new Error('Hugging Face Space URL is not configured (VITE_HF_SPACE_URL).')
  }

  const dataUrl = await fileToDataUrl(imageFile)

  // Gradio expects an ImageData object, not a bare data-URL string.
  const body = {
    data: [{
      url: dataUrl,
      orig_name: imageFile.name || 'image.png',
      mime_type: imageFile.type || 'image/png',
      meta: { _type: 'gradio.FileData' },
    }, model, Boolean(alphaMatting)],
  }

  const submitRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/remove`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })

  if (!submitRes.ok) {
    const t = await submitRes.text().catch(() => '')
    // Helpful messages for common ZeroGPU failures
    if (submitRes.status === 429 || /quota|rate/i.test(t)) {
      throw new Error(
        'HF ZeroGPU quota exceeded. Wait a bit or add VITE_HF_TOKEN (free account gets more quota when authenticated).'
      )
    }
    throw new Error(`HF Space submit failed: ${submitRes.status} ${t.slice(0, 250)}`)
  }

  const submitJson = await submitRes.json()
  const eventId = submitJson.event_id
  if (!eventId) throw new Error('HF Space did not return event_id')

  const dataArray = await readSseResult(
    `${HF_SPACE_URL}/gradio_api/call/remove/${eventId}`
  )
  const output = Array.isArray(dataArray) ? dataArray[0] : dataArray
  if (!output) throw new Error('HF Space returned no image')

  return await outputToBlob(output)
}
