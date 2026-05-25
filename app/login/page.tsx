'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const DEPARTMENTS = ['สำนักปลัด','กองคลัง','กองช่าง','กองการศึกษา','กองสาธารณสุข','กองสวัสดิการสังคม']

  const handleLogin = async () => {
    if (!email || !password) { setError('กรุณากรอกอีเมลและรหัสผ่าน'); return }
    setLoading(true); setError('')
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const { data: profile } = await supabase.from('users').select('role').eq('email', email).single()
      if (profile?.role === 'admin') router.push('/admin')
      else router.push('/tech')
    } catch (e: unknown) {
      setError(e instanceof Error ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' : 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  const handleRegister = async () => {
    if (!email || !password || !fullName || !department) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    setLoading(true); setError('')
    try {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) throw error
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id, email, full_name: fullName, department, role: 'user'
        })
      }
      setSuccess('สมัครสมาชิกสำเร็จ! กรุณายืนยันอีเมลก่อน Login')
      setMode('login')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด')
    } finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0F2F5A 0%,#1B4F8A 50%,#2563EB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, margin: '0 auto 16px' }}>🏛️</div>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>ระบบแจ้งซ่อมไอที</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginTop: 6, fontSize: 14 }}>เทศบาลตำบลสันทราย</p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 32 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', background: 'var(--bg)', borderRadius: 10, padding: 4, marginBottom: 24 }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
                flex: 1, padding: '9px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: mode === m ? 'white' : 'transparent',
                fontFamily: 'Sarabun, sans-serif', fontSize: 14, fontWeight: 600,
                color: mode === m ? 'var(--primary)' : 'var(--text-muted)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s',
              }}>
                {m === 'login' ? '🔑 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <>
                <div>
                  <label className="form-label required">ชื่อ-นามสกุล</label>
                  <input className="form-input" placeholder="นายสมชาย ใจดี" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className="form-label required">แผนก/กอง</label>
                  <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)}>
                    <option value="">-- เลือกแผนก --</option>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </>
            )}
            <div>
              <label className="form-label required">อีเมล</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="form-label required">รหัสผ่าน</label>
              <input className="form-input" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (mode === 'login' ? handleLogin() : handleRegister())} />
            </div>

            {error && <div style={{ background: '#FEE2E2', color: '#991B1B', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>⚠️ {error}</div>}
            {success && <div style={{ background: '#D1FAE5', color: '#065F46', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>✅ {success}</div>}

            <button className="btn-primary" onClick={mode === 'login' ? handleLogin : handleRegister} disabled={loading} style={{ justifyContent: 'center', padding: '13px 24px' }}>
              {loading ? '⏳ กำลังดำเนินการ...' : mode === 'login' ? '🔑 เข้าสู่ระบบ' : '📝 สมัครสมาชิก'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <a href="/" style={{ color: 'var(--text-muted)', fontSize: 13, textDecoration: 'none' }}>← กลับหน้าแจ้งซ่อม</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}