/**
 * Client-side (browser) background removal using @imgly/background-removal
 * Runs entirely in the user's browser — no server, zero cost, private.
 */

let removeBackgroundFn = null

async function loadLibrary() {
  if (removeBackgroundFn) return removeBackgroundFn
  const mod = await import('@imgly/background-removal')
  removeBackgroundFn = mod.removeBackground
  return removeBackgroundFn
}

/**
 * Remove background from a File or Blob entirely in the browser.
 * @param {File|Blob} imageFile
 * @param {object} options - optional config for the library
 * @returns {Promise<Blob>} PNG blob with transparent background
 */
export async function removeBackgroundClient(imageFile, options = {}) {
  const removeBackground = await loadLibrary()

  // Default to a lightweight model for speed + small download
  const config = {
    model: 'isnet_quint8', // tiny / efficient quantized model
    output: {
      format: 'image/png',
      quality: 0.9,
    },
    ...options,
  }

  const blob = await removeBackground(imageFile, config)
  return blob
}

export const CLIENT_MODEL_ID = 'browser'
export const CLIENT_MODEL_INFO = {
  id: CLIENT_MODEL_ID,
  name: 'Browser (Fast & Free)',
  badge: 'Local',
  description: 'Runs in your browser — free, private, no upload',
  icon: 'devices',
  enabled: true,
}
