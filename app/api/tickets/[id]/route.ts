import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendStatusUpdate } from '@/lib/resend'
import { notifyStatusUpdate } from '@/lib/line'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data, error } = await supabase
    .from('tickets').select('*').eq('ticket_no', id).single()
  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  if (body.status) updateData.status = body.status
  if (body.technician_name) updateData.technician_name = body.technician_name
  if (body.resolution_note) updateData.resolution_note = body.resolution_note
  if (body.status === 'เสร็จสิ้น') updateData.resolved_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('tickets').update(updateData).eq('ticket_no', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // ส่ง Email + Line แจ้งเตือนสถานะ
  if (body.status && data.email) {
    try {
      await sendStatusUpdate(data.email, id, {
        reporterName: data.reporter_name,
        deviceType: data.device_type,
        status: body.status,
        technicianName: body.technician_name || data.technician_name || '-',
        resolutionNote: body.resolution_note,
      })
    } catch (e) { console.error('Email error:', e) }

    try {
      await notifyStatusUpdate({
        ticketNo: id,
        reporterName: data.reporter_name,
        deviceType: data.device_type,
        status: body.status,
        technicianName: body.technician_name || data.technician_name || '-',
        resolutionNote: body.resolution_note,
      })
    } catch (e) { console.error('Line error:', e) }
  }

  return NextResponse.json(data)
}