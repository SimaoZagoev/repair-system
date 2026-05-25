const LINE_API = 'https://api.line.me/v2/bot/message/push'
const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN!

async function pushMessage(to: string, messages: object[]) {
  await fetch(LINE_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${TOKEN}`,
    },
    body: JSON.stringify({ to, messages }),
  })
}

export async function notifyNewTicket(data: {
  ticketNo: string
  reporterName: string
  department: string
  deviceType: string
  problemDesc: string
  priority: string
  userLineId?: string
}) {
  const priorityColor: Record<string, string> = {
    'เร่งด่วนมาก': '#EF4444',
    'เร่งด่วน':    '#F97316',
    'ปกติ':        '#F59E0B',
    'ไม่เร่งด่วน': '#10B981',
  }

  const flexMessage = {
    type: 'flex',
    altText: `แจ้งซ่อมใหม่ ${data.ticketNo}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical', backgroundColor: '#1B4F8A',
        contents: [{
          type: 'text', text: '🔧 แจ้งซ่อมใหม่', color: '#FFFFFF', weight: 'bold', size: 'lg'
        }, {
          type: 'text', text: 'เทศบาลตำบลสันทราย', color: 'rgba(255,255,255,0.7)', size: 'sm'
        }]
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: data.ticketNo, weight: 'bold', size: 'xl', color: '#1B4F8A' },
          {
            type: 'box', layout: 'vertical', spacing: 'sm',
            contents: [
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'ผู้แจ้ง', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.reporterName, size: 'sm', flex: 3, weight: 'bold' }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'แผนก', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.department, size: 'sm', flex: 3 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'อุปกรณ์', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.deviceType, size: 'sm', flex: 3 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'อาการ', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.problemDesc.slice(0, 50), size: 'sm', flex: 3, wrap: true }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'ความเร่งด่วน', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.priority, size: 'sm', flex: 3, color: priorityColor[data.priority] || '#000', weight: 'bold' }
              ]},
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{
          type: 'button', style: 'primary', color: '#2563EB',
          action: { type: 'uri', label: '🔍 ดูรายละเอียด', uri: `https://sansai-repair-system.vercel.app/track?id=${data.ticketNo}` }
        }]
      }
    }
  }

  // แจ้ง Admin
  await pushMessage(process.env.LINE_ADMIN_USER_ID!, [flexMessage])

  // แจ้ง User (ถ้ามี Line ID)
  if (data.userLineId) {
    await pushMessage(data.userLineId, [flexMessage])
  }
}

export async function notifyStatusUpdate(data: {
  ticketNo: string
  reporterName: string
  deviceType: string
  status: string
  technicianName: string
  resolutionNote?: string
  userLineId?: string
}) {
  const statusColor: Record<string, string> = {
    'รับงานแล้ว':       '#3B82F6',
    'กำลังดำเนินการ':   '#F59E0B',
    'เสร็จสิ้น':        '#10B981',
  }

  const flexMessage = {
    type: 'flex',
    altText: `อัปเดตงาน ${data.ticketNo} — ${data.status}`,
    contents: {
      type: 'bubble',
      header: {
        type: 'box', layout: 'vertical',
        backgroundColor: statusColor[data.status] || '#1B4F8A',
        contents: [{
          type: 'text', text: `📋 อัปเดตสถานะงาน`, color: '#FFFFFF', weight: 'bold', size: 'lg'
        }]
      },
      body: {
        type: 'box', layout: 'vertical', spacing: 'md',
        contents: [
          { type: 'text', text: data.ticketNo, weight: 'bold', size: 'xl', color: '#1B4F8A' },
          { type: 'text', text: `สถานะ: ${data.status}`, weight: 'bold', color: statusColor[data.status] || '#000', size: 'md' },
          {
            type: 'box', layout: 'vertical', spacing: 'sm',
            contents: [
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'อุปกรณ์', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.deviceType, size: 'sm', flex: 3 }
              ]},
              { type: 'box', layout: 'horizontal', contents: [
                { type: 'text', text: 'ช่าง', color: '#64748b', size: 'sm', flex: 2 },
                { type: 'text', text: data.technicianName, size: 'sm', flex: 3, weight: 'bold' }
              ]},
              ...(data.resolutionNote ? [{
                type: 'box', layout: 'horizontal', contents: [
                  { type: 'text', text: 'วิธีแก้ไข', color: '#64748b', size: 'sm', flex: 2 },
                  { type: 'text', text: data.resolutionNote, size: 'sm', flex: 3, wrap: true }
                ]
              }] : [])
            ]
          }
        ]
      },
      footer: {
        type: 'box', layout: 'vertical',
        contents: [{
          type: 'button', style: 'primary', color: '#2563EB',
          action: { type: 'uri', label: '🔍 ดูรายละเอียด', uri: `https://sansai-repair-system.vercel.app/track?id=${data.ticketNo}` }
        }]
      }
    }
  }

  await pushMessage(process.env.LINE_ADMIN_USER_ID!, [flexMessage])
  if (data.userLineId) await pushMessage(data.userLineId, [flexMessage])
}