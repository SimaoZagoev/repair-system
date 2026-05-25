'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function Navbar() {
  const path = usePathname()
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from('users').select('full_name,role').eq('id', user.id).single()
        if (data) setUser(data)
      }
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    window.location.href = '/'
  }

  const links = [
    { href: '/',      label: '📋 แจ้งซ่อม' },
    { href: '/track', label: '🔍 ติดตามสถานะ' },
    { href: '/tech',  label: '🔧 หน้าช่าง' },
    { href: '/admin', label: '📊 Admin' },
  ]

  return (
    <nav style={{ background: 'linear-gradient(135deg,#0F2F5A 0%,#1B4F8A 100%)', boxShadow: '0 2px 12px rgba(0,0,0,0.15)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🏛️</div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>ระบบแจ้งซ่อมไอที</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>เทศบาลตำบลสันทราย</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              color: path === link.href ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none', padding: '8px 14px', borderRadius: 8,
              fontSize: 14, fontWeight: 500,
              background: path === link.href ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'all 0.2s',
            }}>{link.label}</Link>
          ))}

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '6px 12px' }}>
                <span style={{ color: 'white', fontSize: 13 }}>👤 {user.full_name}</span>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 11, marginLeft: 6 }}>[{user.role}]</span>
              </div>
              <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.8)', border: 'none', color: 'white', padding: '7px 12px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontFamily: 'Sarabun,sans-serif' }}>
                ออกจากระบบ
              </button>
            </div>
          ) : (
            <Link href="/login" style={{ marginLeft: 8, background: 'rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600 }}>
              🔑 Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}