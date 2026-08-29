/**
 * Unified hook for:
 * - browser (client-side)
 * - remove.bg (Vercel API)
 * - HF Space models (u2net, birefnet, ...)
 */
import { useState, useCallback } from 'react'
import { removeBackgroundClient, CLIENT_MODEL_ID } from '../lib/clientSideRemover'
import { removeBackgroundRemoveBg } from '../lib/serverApi'
import { removeBackgroundHF, isHfModel } from '../lib/hfSpaceApi'

export function useBackgroundRemoval() {
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  const [resultUrl, setResultUrl] = useState(null)

  const remove = useCallback(async (file, { model, alphaMatting = false } = {}) => {
    if (!file) return null

    setLoading(true)
    setError(null)
    setProgress(0)
    setResultUrl(null)

    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + Math.random() * 10, 88))
    }, 400)

    try {
      let blob

      if (model === CLIENT_MODEL_ID || model === 'browser') {
        blob = await removeBackgroundClient(file)
      } else if (model === 'remove.bg') {
        blob = await removeBackgroundRemoveBg(file)
      } else if (isHfModel(model)) {
        blob = await removeBackgroundHF(file, { model, alphaMatting })
      } else {
        throw new Error(`Unknown model: ${model}`)
      }

      const url = URL.createObjectURL(blob)
      setResultUrl(url)
      setProgress(100)
      return url
    } catch (e) {
      setError(e.message || 'Something went wrong')
      return null
    } finally {
      clearInterval(interval)
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setLoading(false)
    setProgress(0)
    setError(null)
    setResultUrl(null)
  }, [])

  return { loading, progress, error, resultUrl, remove, reset, setError }
}
