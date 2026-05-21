'use client'
import { useState } from 'react'
import Navbar from '@/components/Navbar'

const DEPARTMENTS = ['สำนักปลัด','กองคลัง','กองช่าง','กองการศึกษา','กองสาธารณสุข','กองสวัสดิการสังคม']
const DEVICE_TYPES = ['คอมพิวเตอร์ตั้งโต๊ะ','คอมพิวเตอร์โน้ตบุ๊ก','เครื่องพิมพ์','สแกนเนอร์','จอมอนิเตอร์','UPS','เครื่องถ่ายเอกสาร','อุปกรณ์เครือข่าย','โปรเจกเตอร์','อื่นๆ']
const PRIORITIES = [
  { value: 'เร่งด่วนมาก', label: '🔴 เร่งด่วนมาก', desc: 'ไม่สามารถทำงานได้เลย' },
  { value: 'เร่งด่วน',    label: '🟠 เร่งด่วน',    desc: 'กระทบงานบางส่วน' },
  { value: 'ปกติ',        label: '🟡 ปกติ',        desc: 'ยังทำงานได้บ้าง' },
  { value: 'ไม่เร่งด่วน', label: '🟢 ไม่เร่งด่วน', desc: 'สะดวกเมื่อไหร่ก็ได้' },
]

interface FormData {
  reporter_name: string
  department: string
  phone: string
  email: string
  device_type: string
  asset_code: string
  problem_desc: string
  priority: string
  image: File | null
}

export default function HomePage() {
  const [form, setForm] = useState<FormData>({
    reporter_name: '', department: '', phone: '', email: '',
    device_type: '', asset_code: '', problem_desc: '',
    priority: 'ปกติ', image: null,
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ ticketNo: string } | null>(null)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const set = (k: keyof FormData, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, image: file }))
    const reader = new FileReader()
    reader.onload = ev => setImagePreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.reporter_name || !form.department || !form.email || !form.device_type || !form.problem_desc) {
      setError('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน')
      return
    }
    setError('')
    setLoading(true)
    try {
      const body = new FormData()
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'image' && v) body.append('image', v as File)
        else if (k !== 'image') body.append(k, v as string)
      })
      const res = await fetch('/api/tickets', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
      setSuccess({ ticketNo: data.ticketNo })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setForm({ reporter_name: '', department: '', phone: '', email: '', device_type: '', asset_code: '', problem_desc: '', priority: 'ปกติ', image: null })
    setSuccess(null); setImagePreview(null); setError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Navbar />

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 20px' }}>

        {/* Header */}
        <div className="animate-in" style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔧</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: 'var(--primary-dark)', margin: 0 }}>แจ้งซ่อมอุปกรณ์ไอที</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: 15 }}>เทศบาลตำบลสันทราย — กรอกข้อมูลให้ครบถ้วนเพื่อให้ช่างดำเนินการได้รวดเร็ว</p>
        </div>

        {/* Success State */}
        {success && (
          <div className="card animate-in" style={{ padding: 40, textAlign: 'center' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <h2 style={{ color: 'var(--success)', fontSize: 22, marginBottom: 8 }}>ส่งคำร้องสำเร็จ!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>กรุณาจดรหัสงานไว้เพื่อติดตามสถานะ</p>
            <div style={{ background: 'var(--bg)', borderRadius: 12, padding: '16px 32px', display: 'inline-block', marginBottom: 24 }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>รหัสงานของคุณ</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--primary)', letterSpacing: 2 }}>{success.ticketNo}</div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button className="btn-primary" onClick={reset}>+ แจ้งซ่อมรายการใหม่</button>
              <a href={`/track?id=${success.ticketNo}`} className="btn-primary" style={{ background: 'linear-gradient(135deg,#10B981,#059669)', textDecoration: 'none' }}>🔍 ติดตามสถานะ</a>
            </div>
          </div>
        )}

        {/* Form */}
        {!success && (
          <div className="card animate-in" style={{ padding: 32 }}>

            {/* Section 1: ข้อมูลผู้แจ้ง */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                👤 ข้อมูลผู้แจ้ง
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label required">ชื่อ-นามสกุล</label>
                  <input className="form-input" placeholder="นายสมชาย ใจดี" value={form.reporter_name} onChange={e => set('reporter_name', e.target.value)} />
                </div>
                <div>
                  <label className="form-label required">แผนก/กอง</label>
                  <select className="form-input" value={form.department} onChange={e => set('department', e.target.value)}>
                    <option value="">-- เลือกแผนก --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">เบอร์โทรศัพท์</label>
                  <input className="form-input" placeholder="08x-xxx-xxxx" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="form-label required">อีเมล</label>
                  <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 2: ข้อมูลอุปกรณ์ */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                💻 ข้อมูลอุปกรณ์
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label className="form-label required">ประเภทอุปกรณ์</label>
                  <select className="form-input" value={form.device_type} onChange={e => set('device_type', e.target.value)}>
                    <option value="">-- เลือกประเภท --</option>
                    {DEVICE_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">รหัสครุภัณฑ์</label>
                  <input className="form-input" placeholder="เช่น 416-xx-xxxx" value={form.asset_code} onChange={e => set('asset_code', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Section 3: อาการและความเร่งด่วน */}
            <div style={{ marginBottom: 28 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--primary)', marginBottom: 16, paddingBottom: 10, borderBottom: '2px solid var(--bg)', display: 'flex', alignItems: 'center', gap: 8 }}>
                📝 รายละเอียดปัญหา
              </h3>

              <div style={{ marginBottom: 16 }}>
                <label className="form-label required">อาการเสีย / ปัญหาที่พบ</label>
                <textarea className="form-input" rows={4} placeholder="อธิบายอาการให้ละเอียด เช่น เปิดเครื่องแล้วไม่ติด มีเสียงดังผิดปกติ จอภาพไม่แสดงผล..." value={form.problem_desc} onChange={e => set('problem_desc', e.target.value)} style={{ resize: 'vertical' }} />
              </div>

              {/* Priority */}
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">ระดับความเร่งด่วน</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                  {PRIORITIES.map(p => (
                    <div key={p.value} onClick={() => set('priority', p.value)} style={{
                      padding: '10px 8px', borderRadius: 10, border: `2px solid ${form.priority === p.value ? 'var(--primary-light)' : 'var(--border)'}`,
                      background: form.priority === p.value ? '#EFF6FF' : 'white',
                      cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s',
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{p.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="form-label">รูปภาพประกอบ (ถ้ามี)</label>
                <label style={{ display: 'block', border: '2px dashed var(--border)', borderRadius: 12, padding: 20, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: imagePreview ? 'transparent' : '#FAFBFC' }}>
                  {imagePreview
                    ? <img src={imagePreview} alt="preview" style={{ maxHeight: 200, borderRadius: 8, maxWidth: '100%' }} />
                    : <div><div style={{ fontSize: 32, marginBottom: 8 }}>📷</div><div style={{ fontSize: 14, color: 'var(--text-muted)' }}>คลิกเพื่อเลือกรูปภาพ</div><div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>PNG, JPG ขนาดไม่เกิน 5MB</div></div>
                  }
                  <input type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
                </label>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{ background: '#FEE2E2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#991B1B', fontSize: 14 }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button className="btn-primary" onClick={handleSubmit} disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: 16 }}>
              {loading ? '⏳ กำลังส่งคำร้อง...' : '📨 ส่งคำร้องแจ้งซ่อม'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}