import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ระบบแจ้งซ่อมไอที | เทศบาลตำบลสันทราย',
  description: 'ระบบแจ้งซ่อมอุปกรณ์เทคโนโลยีสารสนเทศ เทศบาลตำบลสันทราย',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  )
}