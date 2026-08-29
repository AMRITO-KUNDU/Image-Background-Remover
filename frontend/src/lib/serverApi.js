/**
 * Calls Vercel serverless route for remove.bg cloud API.
 * POST /api/remove-background
 */

export async function removeBackgroundRemoveBg(imageFile) {
  const fd = new FormData()
  fd.append('file', imageFile)

  const res = await fetch('/api/remove-background', {
    method: 'POST',
    body: fd,
  })

  if (!res.ok) {
    let detail = 'remove.bg processing failed'
    try {
      const err = await res.json()
      detail = err.detail || detail
    } catch {
      // ignore
    }
    throw new Error(detail)
  }

  return await res.blob()
}

export const REMOVE_BG_MODEL = {
  id: 'remove.bg',
  name: 'remove.bg API',
  badge: 'Cloud',
  description: 'Best quality via cloud API — requires API key on Vercel',
  icon: 'cloud',
  enabled: true,
}
