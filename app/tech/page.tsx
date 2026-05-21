'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'

interface Ticket {
  id: string
  ticket_no: string
  created_at: string
  reporter_name: string
  department: string
  phone: string
  device_type: string
  asset_code: string
  problem_desc: string
  priority: string
  image_url: string | null
  status: string
  technician_name: string | null
  resolution_note: string | null
}

const PRIORITY_COLOR: Record<string, string> = {
  'เร่งด่วนมาก': '#EF4444',
  'เร่งด่วน':    '#F97316',
  'ปกติ':        '#F59E0B',
  'ไม่เร่งด่วน': '#10B981',
}

const STATUS_OPTIONS = ['รอดำเนินการ', 'รับงานแล้ว', 'กำลังดำเนินการ', 'เสร็จสิ้น']

function formatDate(d: string) {
  return new Date(d).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok',
  })
}

export default function TechPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด')
  const [selected, setSelected] = useState<Ticket | null>(null)
  const [techName, setTechName] = useState('')
  const [note, setNote] = useState('')
  const [newStatus, setNewStatus] = useState('')
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }

  const openTicket = (t: Ticket) => {
    setSelected(t)
    setTechName(t.technician_name || '')
    setNote(t.resolution_note || '')
    setNewStatus(t.status)
    setSavedMsg('')
  }

  const saveUpdate = async () => {
    if (!selected) return
    setSaving(true)
    try {
      const res = await fetch(`/api/tickets/${selected.ticket_no}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, technician_name: techName, resolution_note: note }),
      })
      if (res.ok) {
        setSavedMsg('✅ บันทึกสำเร็จ')
        fetchTickets()
        setTimeout(() => setSelected(null), 1200)
      }
    } finally { setSaving(false) }
  }

  const filtered = filterStatus === 'ทั้งหมด' ? tickets : tickets.filter(t => t.status === filterStatus)
  const counts = {
    'ทั้งหมด': tickets.length,
    'รอดำเนินการ': tickets.filter(t => t.status === 'รอดำเนินการ').length,
    'รับงานแล้ว': tickets.filter(t => t.status === 'รับงานแล้ว').length,
    'กำลังดำเนินการ': tickets.filter(t => t.status === 'กำลังดำเนินการ').length,
    'เสร็จสิ้น': tickets.filter(t => t.status === 'เสร็จสิ้น').length,
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>🔧 หน้าช่างไอที</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>จัดการและอัปเดตสถานะงานซ่อมทั้งหมด</p>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {Object.entries(counts).map(([status, count]) => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{
              padding: '8px 16px', borderRadius: 99, border: 'none', cursor: 'pointer',
              background: filterStatus === status ? 'var(--primary-light)' : 'white',
              color: filterStatus === status ? 'white' : 'var(--text)',
              fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 500,
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.2s',
            }}>
              {status} <span style={{ opacity: 0.8 }}>({count})</span>
            </button>
          ))}
        </div>

        {/* Ticket List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>⏳ กำลังโหลด...</div>
        ) : filtered.length === 0 ? (
          <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            ไม่มีงานในสถานะนี้
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(t => (
              <div key={t.id} className="card" style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', border: '1.5px solid transparent' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary-light)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'transparent')}
                onClick={() => openTicket(t)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 15 }}>{t.ticket_no}</span>
                      <span className="badge" style={{ background: PRIORITY_COLOR[t.priority] + '22', color: PRIORITY_COLOR[t.priority] }}>{t.priority}</span>
                      <span className={`badge ${t.status === 'เสร็จสิ้น' ? 'badge-done' : t.status === 'กำลังดำเนินการ' ? 'badge-progress' : 'badge-waiting'}`}>{t.status}</span>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>
                      <strong>{t.device_type}</strong> {t.asset_code && `(${t.asset_code})`} — {t.problem_desc.slice(0, 80)}{t.problem_desc.length > 80 ? '...' : ''}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      👤 {t.reporter_name} · 🏢 {t.department} · 📅 {formatDate(t.created_at)}
                    </div>
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 20 }}>›</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="card animate-in" style={{ width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto', padding: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--primary)' }}>📋 {selected.ticket_no}</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            {/* Info */}
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: 16, marginBottom: 20, fontSize: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  ['👤 ผู้แจ้ง', selected.reporter_name],
                  ['🏢 แผนก', selected.department],
                  ['📱 โทร', selected.phone || '-'],
                  ['💻 อุปกรณ์', selected.device_type],
                  ['🏷️ ครุภัณฑ์', selected.asset_code || '-'],
                  ['⚡ ความเร่งด่วน', selected.priority],
                ].map(([label, value]) => (
                  <div key={label}>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</div>
                    <div style={{ fontWeight: 600 }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>📝 อาการเสีย</div>
                <div>{selected.problem_desc}</div>
              </div>
              {selected.image_url && (
                <div style={{ marginTop: 12 }}>
                  <img src={selected.image_url} alt="รูปอุปกรณ์" style={{ width: '100%', borderRadius: 8, maxHeight: 200, objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* Update Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="form-label">ชื่อช่างที่รับงาน</label>
                <input className="form-input" placeholder="ชื่อช่างไอที" value={techName} onChange={e => setTechName(e.target.value)} />
              </div>
              <div>
                <label className="form-label">อัปเดตสถานะ</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {STATUS_OPTIONS.map(s => (
                    <div key={s} onClick={() => setNewStatus(s)} style={{
                      padding: '10px 12px', borderRadius: 10, border: `2px solid ${newStatus === s ? 'var(--primary-light)' : 'var(--border)'}`,
                      background: newStatus === s ? '#EFF6FF' : 'white', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, textAlign: 'center', transition: 'all 0.15s',
                    }}>{s}</div>
                  ))}
                </div>
              </div>
              <div>
                <label className="form-label">บันทึกวิธีแก้ไข {newStatus === 'เสร็จสิ้น' && <span style={{ color: 'var(--danger)' }}>*</span>}</label>
                <textarea className="form-input" rows={3} placeholder="อธิบายวิธีแก้ไขปัญหา..." value={note} onChange={e => setNote(e.target.value)} style={{ resize: 'vertical' }} />
              </div>

              {savedMsg && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: 8, fontSize: 14 }}>{savedMsg}</div>}

              <button className="btn-primary" onClick={saveUpdate} disabled={saving} style={{ justifyContent: 'center' }}>
                {saving ? '⏳ กำลังบันทึก...' : '💾 บันทึกการอัปเดต'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}