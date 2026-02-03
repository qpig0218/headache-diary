import {
    Heart,
    Footprints,
    Moon,
    Thermometer,
    Activity,
    Droplets,
    Upload,
    FileText,
    Clock,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import HealthImportForm from '@/app/components/HealthImportForm'

const DATA_TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    heartRate: { label: '心率', icon: Heart, color: '#EF4444' },
    steps: { label: '步數', icon: Footprints, color: '#22C55E' },
    sleep: { label: '睡眠', icon: Moon, color: '#8B5CF6' },
    bloodPressure: { label: '血壓', icon: Activity, color: '#F59E0B' },
    bodyTemp: { label: '體溫', icon: Thermometer, color: '#EC4899' },
    bloodOxygen: { label: '血氧', icon: Droplets, color: '#06B6D4' },
}

function formatDate(date: Date) {
    return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default async function HealthPage() {
    const user = await getSession()
    if (!user) redirect('/login')

    const [latestByType, imports, totalRecords] = await Promise.all([
        // Get latest record for each data type
        Promise.all(
            Object.keys(DATA_TYPE_CONFIG).map(async type => {
                const latest = await prisma.healthData.findFirst({
                    where: { userId: user.id, dataType: type },
                    orderBy: { startDate: 'desc' },
                })
                return { type, latest }
            })
        ),
        prisma.healthImport.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        }),
        prisma.healthData.count({ where: { userId: user.id } }),
    ])

    return (
        <div className="health-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">健康數據</h1>
                    <p className="page-description">
                        連接 Apple Health 與其他來源的健康數據
                    </p>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="health-summary">
                <div className="health-total-card">
                    <Activity size={24} />
                    <div>
                        <span className="health-total-value">{totalRecords}</span>
                        <span className="health-total-label">總健康記錄數</span>
                    </div>
                </div>
            </div>

            {/* Health Data Cards */}
            <div className="health-grid">
                {latestByType.map(({ type, latest }) => {
                    const config = DATA_TYPE_CONFIG[type]
                    const Icon = config.icon
                    return (
                        <div key={type} className="health-data-card">
                            <div className="health-data-icon" style={{ backgroundColor: config.color + '20', color: config.color }}>
                                <Icon size={24} />
                            </div>
                            <div className="health-data-info">
                                <span className="health-data-label">{config.label}</span>
                                {latest ? (
                                    <>
                                        <span className="health-data-value">
                                            {latest.value} <small>{latest.unit}</small>
                                        </span>
                                        <span className="health-data-time">{formatDate(latest.startDate)}</span>
                                    </>
                                ) : (
                                    <span className="health-data-empty">尚無數據</span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Import Form */}
            <HealthImportForm />

            {/* Import History */}
            {imports.length > 0 && (
                <div className="import-history">
                    <h3>匯入歷史</h3>
                    <div className="import-list">
                        {imports.map(imp => (
                            <div key={imp.id} className="import-item">
                                <FileText size={18} />
                                <div className="import-info">
                                    <span className="import-filename">{imp.filename}</span>
                                    <span className="import-meta">
                                        {imp.recordCount} 筆記錄 · {imp.format.toUpperCase()}
                                    </span>
                                </div>
                                <span className={`import-status ${imp.status}`}>
                                    {imp.status === 'completed' ? '已完成' :
                                     imp.status === 'failed' ? '失敗' :
                                     imp.status === 'processing' ? '處理中' : '等待中'}
                                </span>
                                <span className="import-date">
                                    <Clock size={14} />
                                    {formatDate(imp.createdAt)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* API Info */}
            <div className="api-info-section">
                <h3>Apple Health API</h3>
                <p className="section-desc">使用以下 API 端點從 iOS App 或 Shortcuts 同步健康數據</p>
                <div className="api-endpoint">
                    <span className="api-method">POST</span>
                    <code>/api/apple-health/sync</code>
                </div>
                <div className="api-example">
                    <h4>請求範例</h4>
                    <pre>{`{
  "data": [
    {
      "dataType": "heartRate",
      "value": 72,
      "unit": "bpm",
      "startDate": "2026-02-03T10:00:00Z"
    },
    {
      "dataType": "steps",
      "value": 8500,
      "unit": "steps",
      "startDate": "2026-02-03T00:00:00Z",
      "endDate": "2026-02-03T23:59:59Z"
    }
  ]
}`}</pre>
                </div>
            </div>
        </div>
    )
}
