import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendTicketConfirmation } from '@/lib/resend'
import { notifyNewTicket } from '@/lib/line'

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

    const { data, error } = await supabase
      .from('tickets')
      .insert([{ reporter_name, department, phone, email, device_type, asset_code, problem_desc, priority, image_url, ticket_no: '' }])
      .select('ticket_no')
      .single()

    if (error) throw error

    // ส่ง Email ยืนยัน
    try {
      await sendTicketConfirmation(email, data.ticket_no, {
        reporterName: reporter_name,
        deviceType: device_type,
        problemDesc: problem_desc,
        priority,
      })
    } catch (e) { console.error('Email error:', e) }

    // แจ้ง Line
    try {
      await notifyNewTicket({
        ticketNo: data.ticket_no,
        reporterName: reporter_name,
        department,
        deviceType: device_type,
        problemDesc: problem_desc,
        priority,
      })
    } catch (e) { console.error('Line error:', e) }

    return NextResponse.json({ success: true, ticketNo: data.ticket_no })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'เกิดข้อผิดพลาด' }, { status: 500 })
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