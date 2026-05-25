import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

interface Ticket {
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

function formatDate(d: string | null) {
  if (!d) return '-'
  return new Date(d).toLocaleString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Bangkok',
  })
}

export function exportToExcel(tickets: Ticket[], filename = 'รายงานแจ้งซ่อมไอที') {
  const data = tickets.map((t, i) => ({
    'ลำดับ': i + 1,
    'รหัสงาน': t.ticket_no,
    'วันที่แจ้ง': formatDate(t.created_at),
    'ชื่อผู้แจ้ง': t.reporter_name,
    'แผนก/กอง': t.department,
    'เบอร์โทร': t.phone || '-',
    'อีเมล': t.email,
    'ประเภทอุปกรณ์': t.device_type,
    'รหัสครุภัณฑ์': t.asset_code || '-',
    'อาการเสีย': t.problem_desc,
    'ความเร่งด่วน': t.priority,
    'สถานะ': t.status,
    'ช่างผู้รับผิดชอบ': t.technician_name || '-',
    'วันที่เสร็จ': formatDate(t.resolved_at),
    'วิธีแก้ไข': t.resolution_note || '-',
  }))

  const ws = XLSX.utils.json_to_sheet(data)

  // ตั้งความกว้างคอลัมน์
  ws['!cols'] = [
    { wch: 6 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 16 },
    { wch: 14 }, { wch: 24 }, { wch: 20 }, { wch: 14 }, { wch: 40 },
    { wch: 14 }, { wch: 16 }, { wch: 18 }, { wch: 18 }, { wch: 40 },
  ]

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'รายการแจ้งซ่อม')

  // Sheet สรุป
  const summary = [
    { 'หัวข้อ': 'งานทั้งหมด', 'จำนวน': tickets.length },
    { 'หัวข้อ': 'รอดำเนินการ', 'จำนวน': tickets.filter(t => t.status === 'รอดำเนินการ').length },
    { 'หัวข้อ': 'กำลังดำเนินการ', 'จำนวน': tickets.filter(t => ['รับงานแล้ว','กำลังดำเนินการ'].includes(t.status)).length },
    { 'หัวข้อ': 'เสร็จสิ้น', 'จำนวน': tickets.filter(t => t.status === 'เสร็จสิ้น').length },
  ]
  const ws2 = XLSX.utils.json_to_sheet(summary)
  ws2['!cols'] = [{ wch: 20 }, { wch: 10 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'สรุป')

  const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  saveAs(blob, `${filename}_${new Date().toLocaleDateString('th-TH').replace(/\//g, '-')}.xlsx`)
}