import { Cpu, Wifi } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DeviceManager from '@/app/components/DeviceManager'

export default async function DevicesPage() {
    const user = await getSession()
    if (!user) redirect('/login')

    const devices = await prisma.ioTDevice.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { readings: true } },
        },
    })

    const activeCount = devices.filter(d => d.active).length

    return (
        <div className="devices-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">IoT 裝置</h1>
                    <p className="page-description">管理您的 IoT 裝置與 Webhook 連線</p>
                </div>
            </div>

            {/* Stats */}
            <div className="device-stats">
                <div className="device-stat-card">
                    <Cpu size={24} />
                    <div>
                        <span className="device-stat-value">{devices.length}</span>
                        <span className="device-stat-label">裝置總數</span>
                    </div>
                </div>
                <div className="device-stat-card">
                    <Wifi size={24} />
                    <div>
                        <span className="device-stat-value">{activeCount}</span>
                        <span className="device-stat-label">啟用中</span>
                    </div>
                </div>
            </div>

            <DeviceManager initialDevices={JSON.parse(JSON.stringify(devices))} />

            {/* Webhook Documentation */}
            <div className="api-info-section">
                <h3>Webhook API</h3>
                <p className="section-desc">使用以下端點從 IoT 裝置推送數據</p>

                <div className="api-endpoint">
                    <span className="api-method">POST</span>
                    <code>/api/iot/webhook</code>
                </div>

                <div className="api-example">
                    <h4>認證方式</h4>
                    <pre>{`Header: X-API-Key: your_device_api_key
或 Query: /api/iot/webhook?key=your_device_api_key`}</pre>
                </div>

                <div className="api-example">
                    <h4>請求範例（單筆）</h4>
                    <pre>{`curl -X POST /api/iot/webhook \\
  -H "X-API-Key: iot_xxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dataType": "temperature",
    "value": 25.5,
    "unit": "°C",
    "timestamp": "2026-02-03T10:00:00Z"
  }'`}</pre>
                </div>

                <div className="api-example">
                    <h4>請求範例（批次）</h4>
                    <pre>{`{
  "readings": [
    { "dataType": "temperature", "value": 25.5, "unit": "°C" },
    { "dataType": "humidity", "value": 65, "unit": "%" },
    { "dataType": "pm25", "value": 12.3, "unit": "µg/m³" }
  ]
}`}</pre>
                </div>

                <div className="api-example">
                    <h4>支援的數據類型</h4>
                    <pre>{`temperature  - 溫度 (°C)
humidity     - 濕度 (%)
pressure     - 氣壓 (hPa)
heartRate    - 心率 (bpm)
pm25         - PM2.5 (µg/m³)
noise        - 噪音 (dB)
bloodPressure - 血壓 (mmHg)
bloodOxygen  - 血氧 (%)
steps        - 步數 (steps)`}</pre>
                </div>
            </div>
        </div>
    )
}
