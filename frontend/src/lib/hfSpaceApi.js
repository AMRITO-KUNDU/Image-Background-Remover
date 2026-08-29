/**
 * Calls Hugging Face Gradio Space for U2-Net + heavy models.
 * Set VITE_HF_SPACE_URL (no trailing slash), e.g.
 * https://USERNAME-bg-remover-models.hf.space
 *
 * Uses Gradio's queue API: /gradio_api/call/{api_name}
 */

const HF_SPACE_URL = (import.meta.env.VITE_HF_SPACE_URL || '').replace(/\/$/, '')

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

async function fileToBase64(file) {
  const buf = await file.arrayBuffer()
  const bytes = new Uint8Array(buf)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  const b64 = btoa(binary)
  const mime = file.type || 'image/png'
  return `data:${mime};base64,${b64}`
}

/**
 * Gradio queue API (works with modern Gradio Spaces)
 */
export async function removeBackgroundHF(imageFile, { model = 'u2net', alphaMatting = false } = {}) {
  if (!HF_SPACE_URL) {
    throw new Error('Hugging Face Space URL is not configured (VITE_HF_SPACE_URL).')
  }

  const dataUrl = await fileToBase64(imageFile)

  // 1) Submit job
  const submitRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      data: [dataUrl, model, alphaMatting],
    }),
  })

  if (!submitRes.ok) {
    // Fallback: older /api/predict style
    const legacy = await fetch(`${HF_SPACE_URL}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [dataUrl, model, alphaMatting],
      }),
    })
    if (!legacy.ok) {
      const t = await submitRes.text().catch(() => '')
      throw new Error(`HF Space error: ${submitRes.status} ${t}`)
    }
    const legacyJson = await legacy.json()
    const out = legacyJson?.data?.[0]
    return await dataUrlOrPathToBlob(out, HF_SPACE_URL)
  }

  const { event_id } = await submitRes.json()
  if (!event_id) throw new Error('HF Space did not return event_id')

  // 2) Poll result stream
  const resultRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/remove/${event_id}`)
  if (!resultRes.ok) {
    throw new Error(`HF Space poll failed: ${resultRes.status}`)
  }

  const text = await resultRes.text()
  // SSE-style: lines with data: {...}
  let output = null
  for (const line of text.split('\n')) {
    if (line.startsWith('data:')) {
      try {
        const payload = JSON.parse(line.slice(5).trim())
        if (Array.isArray(payload) && payload[0]) output = payload[0]
        else if (payload?.output?.data?.[0]) output = payload.output.data[0]
        else if (payload?.data?.[0]) output = payload.data[0]
      } catch {
        // continue
      }
    }
  }

  if (!output) throw new Error('HF Space returned no image')
  return await dataUrlOrPathToBlob(output, HF_SPACE_URL)
}

async function dataUrlOrPathToBlob(out, baseUrl) {
  if (typeof out === 'string') {
    if (out.startsWith('data:')) {
      const res = await fetch(out)
      return await res.blob()
    }
    // path like /file=... or https://
    const url = out.startsWith('http') ? out : `${baseUrl}/file=${out.replace(/^\/file=/, '')}`
    const res = await fetch(url.startsWith('http') ? url : `${baseUrl}${out}`)
    if (!res.ok) {
      // try common Gradio file path
      const res2 = await fetch(`${baseUrl}/gradio_api/file=${encodeURIComponent(out)}`)
      if (res2.ok) return await res2.blob()
      throw new Error('Failed to download result image from HF Space')
    }
    return await res.blob()
  }
  if (out?.url) {
    const res = await fetch(out.url.startsWith('http') ? out.url : `${baseUrl}${out.url}`)
    return await res.blob()
  }
  if (out?.path) {
    const res = await fetch(`${baseUrl}/file=${out.path}`)
    return await res.blob()
  }
  throw new Error('Unexpected HF Space output format')
}
