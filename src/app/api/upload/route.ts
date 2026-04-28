import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

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

export async function POST(req: NextRequest) {
  try {
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

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    return NextResponse.json({ url: dataUrl })
  } catch {
    return NextResponse.json({ error: 'Upload failed', code: 'UPLOAD_FAILED' }, { status: 500 })
  }
}
