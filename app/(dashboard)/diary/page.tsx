import Link from 'next/link'
import { Plus, Calendar, Activity } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import DiarySearch from '@/app/components/DiarySearch'

function getIntensityColor(intensity: number) {
    if (intensity <= 3) return '#22C55E'
    if (intensity <= 6) return '#F59E0B'
    if (intensity <= 8) return '#F97316'
    return '#EF4444'
}

function getIntensityLabel(intensity: number) {
    if (intensity <= 3) return '輕微'
    if (intensity <= 6) return '中度'
    if (intensity <= 8) return '嚴重'
    return '劇烈'
}

function formatDate(date: Date) {
    return {
        date: date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }),
        time: date.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        weekday: date.toLocaleDateString('zh-TW', { weekday: 'short' }),
    }
}

export default async function DiaryPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const user = await getSession()
    if (!user) redirect('/login')

    const params = await searchParams
    const page = parseInt(params.page || '1')
    const searchQuery = params.q || ''
    const limit = 10
    const offset = (page - 1) * limit

    // Build search filter
    const where: any = { userId: user.id }
    if (searchQuery) {
        where.OR = [
            { notes: { contains: searchQuery } },
            { location: { contains: searchQuery } },
            { triggers: { some: { value: { contains: searchQuery } } } },
        ]
    }

    const [logs, total] = await Promise.all([
        prisma.headacheLog.findMany({
            where,
            include: { triggers: true },
            orderBy: { date: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.headacheLog.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)
    const avgIntensity = logs.length > 0
        ? Math.round(logs.reduce((s, l) => s + l.intensity, 0) / logs.length * 10) / 10
        : 0

    return (
        <div className="diary-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">頭痛日記</h1>
                    <p className="page-description">查看與管理您的頭痛記錄</p>
                </div>
                <Link href="/diary/new" className="btn btn-primary">
                    <Plus size={18} />
                    新增記錄
                </Link>
            </div>

            <DiarySearch totalPages={totalPages} currentPage={page} />

            {/* Stats Summary */}
            <div className="stats-summary">
                <div className="stat-item">
                    <span className="stat-number">{total}</span>
                    <span className="stat-text">總記錄</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">{avgIntensity}</span>
                    <span className="stat-text">平均強度</span>
                </div>
            </div>

            {/* Logs List */}
            {logs.length > 0 ? (
                <div className="logs-grid">
                    {logs.map(log => {
                        const { date, time, weekday } = formatDate(log.date)
                        return (
                            <Link key={log.id} href={`/diary/${log.id}`} className="log-card">
                                <div className="log-card-header">
                                    <div className="log-date-info">
                                        <span className="log-date">{date}</span>
                                        <span className="log-weekday">{weekday} {time}</span>
                                    </div>
                                    <div
                                        className="intensity-badge"
                                        style={{
                                            backgroundColor: getIntensityColor(log.intensity) + '20',
                                            color: getIntensityColor(log.intensity),
                                            borderColor: getIntensityColor(log.intensity),
                                        }}
                                    >
                                        <Activity size={14} />
                                        <span>{log.intensity}/10</span>
                                        <span className="intensity-label">{getIntensityLabel(log.intensity)}</span>
                                    </div>
                                </div>
                                <div className="log-card-body">
                                    {log.location && (
                                        <div className="log-location">
                                            <span className="label">位置：</span>
                                            <span>{log.location}</span>
                                        </div>
                                    )}
                                    {log.duration && (
                                        <div className="log-duration">
                                            <span className="label">持續：</span>
                                            <span>{log.duration} 分鐘</span>
                                        </div>
                                    )}
                                    {log.notes && <p className="log-notes">{log.notes}</p>}
                                    {log.triggers.length > 0 && (
                                        <div className="log-triggers">
                                            {log.triggers.slice(0, 3).map((t, i) => (
                                                <span key={i} className="trigger-tag">{t.value}</span>
                                            ))}
                                            {log.triggers.length > 3 && (
                                                <span className="trigger-more">+{log.triggers.length - 3}</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <Calendar size={48} />
                    <h3>尚無記錄</h3>
                    <p>開始記錄您的第一筆頭痛日記</p>
                    <Link href="/diary/new" className="btn btn-primary">
                        <Plus size={18} />
                        新增記錄
                    </Link>
                </div>
            )}
        </div>
    )
}
