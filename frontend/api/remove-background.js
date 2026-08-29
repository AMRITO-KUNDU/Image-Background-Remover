/**
 * Vercel Serverless Function — remove.bg proxy
 * POST /api/remove-background
 * multipart field: file
 * Env: REMOVE_BG_API_KEY
 */

import { IncomingForm } from 'formidable'
import fs from 'fs'

export const config = {
  api: {
    bodyParser: false,
  },
}

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm({
      maxFileSize: 20 * 1024 * 1024,
      keepExtensions: true,
    })
    form.parse(req, (err, fields, files) => {
      if (err) reject(err)
      else resolve({ fields, files })
    })
  })
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ detail: 'Method not allowed' })
  }

  const apiKey = process.env.REMOVE_BG_API_KEY
  if (!apiKey) {
    return res.status(400).json({
      detail: 'REMOVE_BG_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables.',
    })
  }

  try {
    const { files } = await parseForm(req)
    const fileEntry = files.file || files.image
    const file = Array.isArray(fileEntry) ? fileEntry[0] : fileEntry

    if (!file?.filepath) {
      return res.status(400).json({ detail: 'No image file uploaded. Use form field name: file' })
    }

    const buffer = fs.readFileSync(file.filepath)
    const mime = file.mimetype || 'image/jpeg'
    const filename = file.originalFilename || 'image.jpg'

    try {
      fs.unlinkSync(file.filepath)
    } catch {
      // ignore
    }

    const formData = new FormData()
    formData.append('image_file', new Blob([buffer], { type: mime }), filename)
    formData.append('size', 'auto')

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: { 'X-Api-Key': apiKey },
      body: formData,
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({
        detail: `remove.bg error: ${errText}`,
      })
    }

    const result = Buffer.from(await response.arrayBuffer())
    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', 'attachment; filename=removed_bg.png')
    res.setHeader('X-Model-Used', 'remove.bg')
    return res.status(200).send(result)
  } catch (e) {
    console.error('[remove-background]', e)
    return res.status(500).json({ detail: e.message || 'Processing failed' })
  }
}
