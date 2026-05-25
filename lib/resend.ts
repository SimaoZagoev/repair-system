import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendTicketConfirmation(to: string, ticketNo: string, data: {
  reporterName: string
  deviceType: string
  problemDesc: string
  priority: string
}) {
  await resend.emails.send({
    from: 'ระบบแจ้งซ่อมไอที <onboarding@resend.dev>',
    to,
    subject: `✅ รับแจ้งซ่อมแล้ว — ${ticketNo}`,
    html: `
      <div style="font-family:Sarabun,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px">
        <div style="background:linear-gradient(135deg,#1B4F8A,#2563EB);padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">🔧 ระบบแจ้งซ่อมไอที</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0">เทศบาลตำบลสันทราย</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <h2 style="color:#10B981;margin:0 0 16px">✅ รับคำร้องแจ้งซ่อมเรียบร้อยแล้ว</h2>
          <div style="background:#f1f5f9;border-radius:8px;padding:16px;margin-bottom:16px">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b">รหัสงาน</p>
            <p style="margin:0;font-size:24px;font-weight:700;color:#1B4F8A;letter-spacing:2px">${ticketNo}</p>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:40%">ผู้แจ้ง</td><td style="padding:8px 0;font-weight:600">${data.reporterName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">อุปกรณ์</td><td style="padding:8px 0;font-weight:600">${data.deviceType}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">อาการ</td><td style="padding:8px 0">${data.problemDesc}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">ความเร่งด่วน</td><td style="padding:8px 0;font-weight:600">${data.priority}</td></tr>
          </table>
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center">
            <a href="https://sansai-repair-system.vercel.app/track?id=${ticketNo}" 
               style="background:linear-gradient(135deg,#2563EB,#1B4F8A);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              🔍 ติดตามสถานะ
            </a>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendStatusUpdate(to: string, ticketNo: string, data: {
  reporterName: string
  deviceType: string
  status: string
  technicianName: string
  resolutionNote?: string
}) {
  const statusEmoji: Record<string, string> = {
    'รับงานแล้ว': '👨‍🔧',
    'กำลังดำเนินการ': '🔧',
    'เสร็จสิ้น': '✅',
  }

  await resend.emails.send({
    from: 'ระบบแจ้งซ่อมไอที <onboarding@resend.dev>',
    to,
    subject: `${statusEmoji[data.status] || '📋'} อัปเดตสถานะงาน ${ticketNo} — ${data.status}`,
    html: `
      <div style="font-family:Sarabun,sans-serif;max-width:600px;margin:0 auto;background:#f8fafc;padding:20px">
        <div style="background:linear-gradient(135deg,#1B4F8A,#2563EB);padding:24px;border-radius:12px 12px 0 0;text-align:center">
          <h1 style="color:white;margin:0;font-size:20px">🔧 ระบบแจ้งซ่อมไอที</h1>
          <p style="color:rgba(255,255,255,0.8);margin:4px 0 0">เทศบาลตำบลสันทราย</p>
        </div>
        <div style="background:white;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.08)">
          <h2 style="color:#1B4F8A;margin:0 0 16px">${statusEmoji[data.status] || '📋'} อัปเดตสถานะ: ${data.status}</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:8px 0;color:#64748b;width:40%">รหัสงาน</td><td style="padding:8px 0;font-weight:700;color:#1B4F8A">${ticketNo}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">ผู้แจ้ง</td><td style="padding:8px 0">${data.reporterName}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">อุปกรณ์</td><td style="padding:8px 0">${data.deviceType}</td></tr>
            <tr><td style="padding:8px 0;color:#64748b">ช่างผู้รับผิดชอบ</td><td style="padding:8px 0;font-weight:600">${data.technicianName}</td></tr>
            ${data.resolutionNote ? `<tr><td style="padding:8px 0;color:#64748b">วิธีแก้ไข</td><td style="padding:8px 0">${data.resolutionNote}</td></tr>` : ''}
          </table>
          <div style="margin-top:20px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center">
            <a href="https://sansai-repair-system.vercel.app/track?id=${ticketNo}"
               style="background:linear-gradient(135deg,#2563EB,#1B4F8A);color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
              🔍 ดูรายละเอียด
            </a>
          </div>
        </div>
      </div>
    `,
  })
}