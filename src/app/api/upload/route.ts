import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/quicktime',
  'video/webm',
  'video/x-m4v',
]

const fileSchema = z.object({
  type: z.string().refine((t) => ALLOWED_TYPES.includes(t), {
    message: 'File type not allowed',
  }),
  name: z.string().min(1, { message: 'File name is required' }),
  size: z.number().max(50 * 1024 * 1024, { message: 'File too large (max 50MB)' }),
})

function createTransloaditSignature(params: string, secret: string): string {
  return crypto.createHmac('sha384', secret).update(params).digest('hex')
}

async function uploadToTransloadit(
  file: File,
  authKey: string,
  authSecret: string
): Promise<string> {
  const expires = new Date(Date.now() + 60 * 60 * 1000)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d{3}Z$/, '+00:00')

  const params = JSON.stringify({
    auth: { key: authKey, expires },
    steps: {
      exported: {
        use: ':original',
        robot: '/file/store',
      },
    },
  })

  const signature = `sha384:${createTransloaditSignature(params, authSecret)}`

  const form = new FormData()
  form.append('params', params)
  form.append('signature', signature)
  form.append('file', file)

  const res = await fetch('https://api2.transloadit.com/assemblies', {
    method: 'POST',
    body: form,
  })

  if (!res.ok) {
    throw new Error(`Transloadit HTTP error: ${res.status}`)
  }

  const json = await res.json() as {
    ok?: string
    error?: string
    assembly_ssl_url?: string
    results?: {
      exported?: Array<{ ssl_url?: string; url?: string }>
    }
  }

  if (json.error) {
    throw new Error(`Transloadit error: ${json.error}`)
  }

  // poll until assembly is complete
  const assemblyUrl = json.assembly_ssl_url
  if (!assemblyUrl) throw new Error('No assembly URL returned')

  for (let i = 0; i < 15; i++) {
    await new Promise((r) => setTimeout(r, 1500))

    const pollRes = await fetch(assemblyUrl)
    if (!pollRes.ok) continue

    const poll = await pollRes.json() as {
      ok?: string
      results?: {
        exported?: Array<{ ssl_url?: string; url?: string }>
      }
    }

    if (poll.ok === 'ASSEMBLY_COMPLETED') {
      const url = poll.results?.exported?.[0]?.ssl_url
        ?? poll.results?.exported?.[0]?.url
      if (url) return url
      throw new Error('Assembly completed but no URL in results')
    }
  }

  throw new Error('Transloadit assembly timed out')
}

export async function POST(req: NextRequest) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')

  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided', code: 'NO_FILE' }, { status: 400 })
  }

  const parsed = fileSchema.safeParse({ type: file.type, name: file.name, size: file.size })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.errors[0]?.message ?? 'Invalid file', code: 'INVALID_FILE' },
      { status: 400 }
    )
  }

  const authKey = process.env.TRANSLOADIT_KEY
  const authSecret = process.env.TRANSLOADIT_SECRET

  if (authKey && authSecret) {
    try {
      const url = await uploadToTransloadit(file, authKey, authSecret)
      return NextResponse.json({ url })
    } catch (err) {
      // log the actual error for debugging
      console.error('Transloadit upload failed:', err instanceof Error ? err.message : err)
      // fall through to base64 fallback
    }
  }

  // fallback: base64 data URL (works without Transloadit config)
  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString('base64')
  return NextResponse.json({ url: `data:${file.type};base64,${base64}` })
}