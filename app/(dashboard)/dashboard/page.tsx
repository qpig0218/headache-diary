import Link from 'next/link'
import {
    Plus,
    Activity,
    Cloud,
    Wind,
    Calendar,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Sun,
    Droplets,
    Gauge,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { fetchWeatherData, fetchAirQualityData } from '@/lib/env-data'
import { redirect } from 'next/navigation'

function getIntensityColor(intensity: number) {
    if (intensity <= 3) return '#22C55E'
    if (intensity <= 6) return '#F59E0B'
    if (intensity <= 8) return '#F97316'
    return '#EF4444'
}

function formatDate(date: Date) {
    return date.toLocaleDateString('zh-TW', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

export default async function DashboardPage() {
    const user = await getSession()
    if (!user) redirect('/login')

    // Fetch all data server-side in parallel
    const [weather, airQuality, logsResult, totalLogs] = await Promise.all([
        fetchWeatherData(),
        fetchAirQualityData(),
        prisma.headacheLog.findMany({
            where: { userId: user.id },
            orderBy: { date: 'desc' },
            take: 5,
            select: { id: true, date: true, intensity: true, location: true, duration: true, notes: true },
        }),
        prisma.headacheLog.count({ where: { userId: user.id } }),
    ])

    const recentLogs = logsResult

    // Calculate stats server-side
    const avgIntensity = recentLogs.length > 0
        ? Math.round(recentLogs.reduce((sum, l) => sum + l.intensity, 0) / recentLogs.length * 10) / 10
        : 0

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const lastWeekLogs = recentLogs.filter(l => l.date >= weekAgo)
    const trend = lastWeekLogs.length > 3 ? 'up' : lastWeekLogs.length < 2 ? 'down' : 'stable'

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">儀表板</h1>
                    <p className="page-description">歡迎回來，查看您的頭痛追蹤概況</p>
                </div>
                <Link href="/diary/new" className="btn btn-primary">
                    <Plus size={18} />
                    新增記錄
                </Link>
            </div>

            <div className="bento-grid dashboard-grid">
                {/* Quick Record Card */}
                <div className="bento-item bento-span-2 quick-record-card">
                    <div className="quick-record-content">
                        <h3>快速記錄</h3>
                        <p>現在有頭痛嗎？點擊下方開始記錄</p>
                        <Link href="/diary/new" className="btn btn-primary btn-lg">
                            <Activity size={20} />
                            記錄頭痛
                        </Link>
                    </div>
                    <div className="quick-record-visual">
                        <div className="pulse-ring"></div>
                        <div className="pulse-ring" style={{ animationDelay: '0.5s' }}></div>
                        <div className="pulse-ring" style={{ animationDelay: '1s' }}></div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="bento-item stat-card">
                    <div className="stat-icon"><Calendar size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{totalLogs}</span>
                        <span className="stat-label">總記錄數</span>
                    </div>
                </div>

                <div className="bento-item stat-card">
                    <div className="stat-icon"><Activity size={24} /></div>
                    <div className="stat-content">
                        <span className="stat-value">{avgIntensity}</span>
                        <span className="stat-label">平均強度</span>
                    </div>
                    <div className={`stat-trend ${trend}`}>
                        {trend === 'up' ? (
                            <><TrendingUp size={16} /><span>上升</span></>
                        ) : trend === 'down' ? (
                            <><TrendingDown size={16} /><span>下降</span></>
                        ) : (
                            <span>穩定</span>
                        )}
                    </div>
                </div>

                {/* Weather Card */}
                <div className="bento-item weather-card">
                    <div className="weather-header"><Cloud size={20} /><span>天氣狀況</span></div>
                    {weather && (
                        <div className="weather-content">
                            <div className="weather-main">
                                <Sun size={48} className="weather-icon-large" />
                                <div className="weather-temp">
                                    <span className="temp-value">{weather.temp}°</span>
                                    <span className="temp-desc">{weather.description}</span>
                                </div>
                            </div>
                            <div className="weather-details">
                                <div className="weather-detail"><Droplets size={16} /><span>{weather.humidity}%</span></div>
                                <div className="weather-detail"><Gauge size={16} /><span>{weather.pressure} hPa</span></div>
                                <div className="weather-detail"><Wind size={16} /><span>{weather.windSpeed} m/s</span></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Air Quality Card */}
                <div className="bento-item airquality-card">
                    <div className="weather-header"><Wind size={20} /><span>空氣品質</span></div>
                    {airQuality && (
                        <div className="airquality-content">
                            <div
                                className="aqi-badge"
                                style={{ backgroundColor: airQuality.levelColor + '20', color: airQuality.levelColor }}
                            >
                                <span className="aqi-value">{airQuality.aqi}</span>
                                <span className="aqi-label">{airQuality.level}</span>
                            </div>
                            {airQuality.pm25 !== null && (
                                <div className="pm25-info">
                                    <span className="pm25-label">PM2.5</span>
                                    <span className="pm25-value">{airQuality.pm25} µg/m³</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Recent Logs */}
                <div className="bento-item bento-span-2 recent-logs-card">
                    <div className="card-header">
                        <h3>最近記錄</h3>
                        <Link href="/diary" className="btn btn-ghost btn-sm">查看全部</Link>
                    </div>
                    {recentLogs.length > 0 ? (
                        <div className="logs-list">
                            {recentLogs.map(log => (
                                <Link key={log.id} href={`/diary/${log.id}`} className="log-item">
                                    <div className="log-intensity" style={{ backgroundColor: getIntensityColor(log.intensity) }}>
                                        {log.intensity}
                                    </div>
                                    <div className="log-info">
                                        <span className="log-date">{formatDate(log.date)}</span>
                                        <span className="log-location">{log.location || '未指定位置'}</span>
                                    </div>
                                    {log.duration && <div className="log-duration">{log.duration} 分鐘</div>}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <AlertTriangle size={32} />
                            <p>尚無記錄</p>
                            <Link href="/diary/new" className="btn btn-secondary btn-sm">新增第一筆記錄</Link>
                        </div>
                    )}
                </div>

                {/* Tips Card */}
                <div className="bento-item bento-span-2 tips-card">
                    <h3>健康小提醒</h3>
                    <p>
                        規律的睡眠、充足的水分攝取、適度的運動都有助於減少頭痛發作。
                        持續記錄您的頭痛模式，有助於發現可能的觸發因素。
                    </p>
                </div>
            </div>
        </div>
    )
}
