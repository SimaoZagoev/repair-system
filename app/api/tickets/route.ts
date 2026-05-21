import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData()

    const reporter_name = body.get('reporter_name') as string
    const department    = body.get('department') as string
    const phone         = body.get('phone') as string
    const email         = body.get('email') as string
    const device_type   = body.get('device_type') as string
    const asset_code    = body.get('asset_code') as string
    const problem_desc  = body.get('problem_desc') as string
    const priority      = body.get('priority') as string
    const imageFile     = body.get('image') as File | null

    // Upload รูปภาพ (ถ้ามี)
    let image_url = null
    if (imageFile && imageFile.size > 0) {
      const ext = imageFile.name.split('.').pop()
      const filename = `${Date.now()}.${ext}`
      const arrayBuffer = await imageFile.arrayBuffer()
      const { error: uploadError } = await supabase.storage
        .from('repair-images')
        .upload(filename, arrayBuffer, { contentType: imageFile.type })

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('repair-images').getPublicUrl(filename)
        image_url = urlData.publicUrl
      }
    }

    // บันทึกลง Database
    const { data, error } = await supabase
      .from('tickets')
      .insert([{ reporter_name, department, phone, email, device_type, asset_code, problem_desc, priority, image_url, ticket_no: '' }])
      .select('ticket_no')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, ticketNo: data.ticket_no })

  } catch (err: unknown) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }, { status: 500 })
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}