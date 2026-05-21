'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'

interface Ticket {
  id: string
  ticket_no: string
  created_at: string
  reporter_name: string
  department: string
  phone: string
  email: string
  device_type: string
  asset_code: string
  problem_desc: string
  priority: string
  image_url: string | null
  status: string
  technician_name: string | null
  resolved_at: string | null
  resolution_note: string | null
}

const STATUS_STEPS = ['รอดำเนินการ', 'รับงานแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น']

const PRIORITY_COLOR: Record<string, string> = {
  'เร่งด่วนมาก': '#EF4444',
  'เร่งด่วน':    '#F97316',
  'ปกติ':        '#F59E0B',
  'ไม่เร่งด่วน': '#10B981',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('th-TH', {
    year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'Asia/Bangkok',
  })
}

function TrackContent() {
  const searchParams = useSearchParams()
  const [searchId, setSearchId] = useState(searchParams.get('id') || '')
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const id = searchParams.get('id')
    if (id) { setSearchId(id); fetchTicket(id) }
  }, [searchParams])

  const fetchTicket = async (id?: string) => {
    const query = id || searchId
    if (!query.trim()) { setError('กรุณากรอกรหัสงาน'); return }
    setLoading(true); setError(''); setTicket(null)
    try {
      const res = await fetch(`/api/tickets/${encodeURIComponent(query.trim())}`)
      if (res.status === 404) { setError('ไม่พบรหัสงานนี้ในระบบ'); return }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setTicket(data)
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const stepIndex = ticket ? STATUS_STEPS.indexOf(ticket.status) : -1

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 20px' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔍</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>ติดตามสถานะการซ่อม</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8 }}>กรอกรหัสงานที่ได้รับเมื่อแจ้งซ่อม</p>
      </div>

      {/* Search Box */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            className="form-input"
            placeholder="เช่น IT-20250521-0001"
            value={searchId}
            onChange={e => setSearchId(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && fetchTicket()}
            style={{ flex: 1, fontSize: 16, letterSpacing: 1 }}
          />
          <button className="btn-primary" onClick={() => fetchTicket()} disabled={loading} style={{ whiteSpace: 'nowrap' }}>
            {loading ? '⏳' : '🔍 ค้นหา'}
          </button>
        </div>
        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEE2E2', borderRadius: 8, color: '#991B1B', fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Result */}
      {ticket && (
        <div className="animate-in">

          {/* Status Progress */}
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: 'var(--primary)' }}>📊 สถานะงาน — {ticket.ticket_no}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              {STATUS_STEPS.map((step, i) => (
                <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                    {i > 0 && <div style={{ flex: 1, height: 3, background: i <= stepIndex ? 'var(--primary-light)' : 'var(--border)', transition: 'background 0.3s' }} />}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: i <= stepIndex ? 'var(--primary-light)' : 'var(--border)',
                      color: i <= stepIndex ? 'white' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, transition: 'all 0.3s',
                      boxShadow: i === stepIndex ? '0 0 0 4px rgba(37,99,235,0.2)' : 'none',
                    }}>
                      {i < stepIndex ? '✓' : i + 1}
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div style={{ flex: 1, height: 3, background: i < stepIndex ? 'var(--primary-light)' : 'var(--border)', transition: 'background 0.3s' }} />}
                  </div>
                  <div style={{ fontSize: 11, marginTop: 8, textAlign: 'center', color: i <= stepIndex ? 'var(--primary)' : 'var(--text-muted)', fontWeight: i === stepIndex ? 700 : 400 }}>
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ticket Details */}
          <div className="card" style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>รหัสงาน</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)', letterSpacing: 1 }}>{ticket.ticket_no}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge" style={{ background: PRIORITY_COLOR[ticket.priority] + '22', color: PRIORITY_COLOR[ticket.priority] }}>
                  {ticket.priority}
                </span>
                <span className={`badge ${ticket.status === 'เสร็จสิ้น' ? 'badge-done' : ticket.status === 'กำลังดำเนินการ' ? 'badge-progress' : 'badge-waiting'}`}>
                  {ticket.status}
                </span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { label: '👤 ผู้แจ้ง', value: ticket.reporter_name },
                { label: '🏢 แผนก', value: ticket.department },
                { label: '📱 เบอร์โทร', value: ticket.phone || '-' },
                { label: '💻 อุปกรณ์', value: ticket.device_type },
                { label: '🏷️ รหัสครุภัณฑ์', value: ticket.asset_code || '-' },
                { label: '📅 วันที่แจ้ง', value: formatDate(ticket.created_at) },
                ...(ticket.technician_name ? [{ label: '🔧 ช่างที่รับงาน', value: ticket.technician_name }] : []),
                ...(ticket.resolved_at ? [{ label: '✅ วันที่เสร็จ', value: formatDate(ticket.resolved_at) }] : []),
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 16, background: 'var(--bg)', borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>📝 อาการเสีย</div>
              <div style={{ fontSize: 14 }}>{ticket.problem_desc}</div>
            </div>

            {ticket.resolution_note && (
              <div style={{ marginTop: 12, background: '#D1FAE5', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 12, color: '#065F46', marginBottom: 4 }}>✅ วิธีแก้ไข</div>
                <div style={{ fontSize: 14, color: '#065F46' }}>{ticket.resolution_note}</div>
              </div>
            )}

            {ticket.image_url && (
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>📷 รูปภาพประกอบ</div>
                <img src={ticket.image_url} alt="รูปอุปกรณ์" style={{ maxWidth: '100%', borderRadius: 10, maxHeight: 300, objectFit: 'cover' }} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function TrackPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>⏳ กำลังโหลด...</div>}>
        <TrackContent />
      </Suspense>
    </div>
  )
}