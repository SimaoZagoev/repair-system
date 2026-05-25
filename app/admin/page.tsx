'use client'
import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { exportToExcel } from '@/lib/excel'

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
  status: string
  technician_name: string | null
  resolved_at: string | null
  resolution_note: string | null
}

function formatDate(d: string) {
  return new Date(d).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric', timeZone: 'Asia/Bangkok',
  })
}

export default function AdminPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => { fetchTickets() }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tickets')
      const data = await res.json()
      setTickets(Array.isArray(data) ? data : [])
    } finally { setLoading(false) }
  }

  const stats = {
    total: tickets.length,
    waiting: tickets.filter(t => t.status === 'รอดำเนินการ').length,
    inProgress: tickets.filter(t => ['รับงานแล้ว','กำลังดำเนินการ'].includes(t.status)).length,
    done: tickets.filter(t => t.status === 'เสร็จสิ้น').length,
    urgent: tickets.filter(t => t.priority === 'เร่งด่วนมาก' && t.status !== 'เสร็จสิ้น').length,
  }

  // กราฟแผนก
  const deptCount: Record<string, number> = {}
  tickets.forEach(t => { deptCount[t.department] = (deptCount[t.department] || 0) + 1 })
  const maxDept = Math.max(...Object.values(deptCount), 1)

  // กราฟประเภทอุปกรณ์
  const deviceCount: Record<string, number> = {}
  tickets.forEach(t => { deviceCount[t.device_type] = (deviceCount[t.device_type] || 0) + 1 })
  const topDevices = Object.entries(deviceCount).sort((a,b) => b[1]-a[1]).slice(0, 5)
  const maxDevice = Math.max(...topDevices.map(d => d[1]), 1)

  const filtered = tickets.filter(t =>
    t.ticket_no.includes(search.toUpperCase()) ||
    t.reporter_name.includes(search) ||
    t.department.includes(search) ||
    t.device_type.includes(search)
  )

  const STAT_CARDS = [
    { label: 'งานทั้งหมด',      value: stats.total,      color: '#1B4F8A', bg: '#EFF6FF', icon: '📋' },
    { label: 'รอดำเนินการ',     value: stats.waiting,    color: '#92400E', bg: '#FEF3C7', icon: '⏳' },
    { label: 'กำลังดำเนินการ',  value: stats.inProgress, color: '#1E40AF', bg: '#DBEAFE', icon: '🔧' },
    { label: 'เสร็จสิ้น',       value: stats.done,       color: '#065F46', bg: '#D1FAE5', icon: '✅' },
    { label: 'เร่งด่วน (ค้าง)', value: stats.urgent,     color: '#991B1B', bg: '#FEE2E2', icon: '🚨' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-primary" onClick={fetchTickets} style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}> 🔄 รีเฟรช  </button>
          <button className="btn-primary" onClick={() => exportToExcel(tickets)} style={{ background: 'linear-gradient(135deg,#F59E0B,#D97706)' }}> 📊 Export Excel </button>
          <a href="/login" className="btn-primary" style={{ background: 'linear-gradient(135deg,#6366F1,#4F46E5)', textDecoration: 'none' }}> 🔑 Login </a>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
          {STAT_CARDS.map(s => (
            <div key={s.label} className="card" style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Chart: แผนก */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>🏢 งานแยกตามแผนก</h3>
            {Object.entries(deptCount).length === 0
              ? <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>ยังไม่มีข้อมูล</div>
              : Object.entries(deptCount).sort((a,b) => b[1]-a[1]).map(([dept, count]) => (
                <div key={dept} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{dept}</span><span style={{ fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count/maxDept)*100}%`, background: 'linear-gradient(90deg, var(--primary-light), var(--primary))', borderRadius: 99, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))
            }
          </div>

          {/* Chart: ประเภทอุปกรณ์ */}
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginBottom: 16 }}>💻 อุปกรณ์ที่แจ้งซ่อมมากสุด</h3>
            {topDevices.length === 0
              ? <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 20 }}>ยังไม่มีข้อมูล</div>
              : topDevices.map(([device, count]) => (
                <div key={device} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                    <span>{device}</span><span style={{ fontWeight: 700 }}>{count}</span>
                  </div>
                  <div style={{ height: 8, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(count/maxDevice)*100}%`, background: 'linear-gradient(90deg, #F59E0B, #F97316)', borderRadius: 99, transition: 'width 0.5s' }} />
                  </div>
                </div>
              ))
            }
          </div>
        </div>

        {/* Table */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--primary)' }}>📋 รายการทั้งหมด ({filtered.length})</h3>
            <input className="form-input" placeholder="🔍 ค้นหา รหัส/ชื่อ/แผนก/อุปกรณ์..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: 280 }} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>⏳ กำลังโหลด...</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg)' }}>
                    {['รหัสงาน','วันที่แจ้ง','ผู้แจ้ง','แผนก','อุปกรณ์','ความเร่งด่วน','สถานะ','ช่าง'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>ไม่พบข้อมูล</td></tr>
                  ) : filtered.map((t, i) => (
                    <tr key={t.id} style={{ borderTop: '1px solid var(--border)', background: i % 2 === 0 ? 'white' : '#FAFBFC' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>{t.ticket_no}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{formatDate(t.created_at)}</td>
                      <td style={{ padding: '10px 12px' }}>{t.reporter_name}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{t.department}</td>
                      <td style={{ padding: '10px 12px' }}>{t.device_type}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className="badge" style={{ background: '#FEF3C7', color: '#92400E', fontSize: 11 }}>{t.priority}</span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span className={`badge ${t.status === 'เสร็จสิ้น' ? 'badge-done' : t.status === 'กำลังดำเนินการ' ? 'badge-progress' : 'badge-waiting'}`} style={{ fontSize: 11 }}>
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{t.technician_name || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}