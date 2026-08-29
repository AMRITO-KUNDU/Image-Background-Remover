/**
 * Calls Hugging Face Space for U2-Net + heavy models.
 * Set VITE_HF_SPACE_URL in frontend env.
 */

const HF_SPACE_URL = (import.meta.env.VITE_HF_SPACE_URL || '').replace(/\/$/, '')

export const HF_MODELS = {
  u2net: {
    id: 'u2net',
    name: 'U2-Net',
    badge: 'HF',
    description: 'Fast general model on Hugging Face Spaces',
    icon: 'memory',
  },
  'u2netp': {
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
  return Object.values(HF_MODELS).map((m) => ({
    ...m,
    enabled: true,
  }))
}

export async function removeBackgroundHF(imageFile, { model = 'u2net', alphaMatting = false } = {}) {
  if (!HF_SPACE_URL) {
    throw new Error('Hugging Face Space URL is not configured (VITE_HF_SPACE_URL).')
  }

  const fd = new FormData()
  fd.append('file', imageFile)
  fd.append('model', model)
  fd.append('alpha_matting', String(alphaMatting))

  const res = await fetch(`${HF_SPACE_URL}/api/remove-background`, {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    let detail = 'HF Space processing failed'
    try {
      const err = await res.json()
      detail = err.detail || err.error || detail
    } catch {
      // ignore
    }
    throw new Error(detail)
  }

  return await res.blob()
}

export async function fetchHfModels() {
  if (!HF_SPACE_URL) return {}
  try {
    const res = await fetch(`${HF_SPACE_URL}/api/models`)
    if (!res.ok) return {}
    const data = await res.json()
    return data.models || {}
  } catch {
    return {}
  }
}
