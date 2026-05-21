'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  const links = [
    { href: '/',         label: '📋 แจ้งซ่อม' },
    { href: '/track',    label: '🔍 ติดตามสถานะ' },
    { href: '/tech',     label: '🔧 หน้าช่าง' },
    { href: '/admin',    label: '📊 Admin' },
  ]

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #0F2F5A 0%, #1B4F8A 100%)',
      boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
            🏛️
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>ระบบแจ้งซ่อมไอที</div>
            <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 12 }}>เทศบาลตำบลสันทราย</div>
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 4 }}>
          {links.map(link => (
            <Link key={link.href} href={link.href} style={{
              color: path === link.href ? 'white' : 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              padding: '8px 14px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              background: path === link.href ? 'rgba(255,255,255,0.15)' : 'transparent',
              transition: 'all 0.2s',
            }}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}