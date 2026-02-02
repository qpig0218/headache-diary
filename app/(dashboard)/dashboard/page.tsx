'use client'

import { useEffect, useState } from 'react'
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

interface WeatherData {
    temp: number
    humidity: number
    pressure: number
    description: string
    icon: string
    windSpeed: number
}

interface AirQualityData {
    aqi: number
    level: string
    levelColor: string
    pm25: number | null
}

interface HeadacheLog {
    id: string
    date: string
    intensity: number
    location: string | null
    duration: number | null
    notes: string | null
}

interface Stats {
    totalLogs: number
    avgIntensity: number
    lastWeekCount: number
    trend: 'up' | 'down' | 'stable'
}

export default function DashboardPage() {
    const [weather, setWeather] = useState<WeatherData | null>(null)
    const [airQuality, setAirQuality] = useState<AirQualityData | null>(null)
    const [recentLogs, setRecentLogs] = useState<HeadacheLog[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch all data
        Promise.all([
            fetch('/api/weather').then(r => r.json()),
            fetch('/api/airquality').then(r => r.json()),
            fetch('/api/headaches?limit=5').then(r => r.json()),
        ])
            .then(([weatherRes, airRes, logsRes]) => {
                setWeather(weatherRes.weather)
                setAirQuality(airRes.airQuality)
                setRecentLogs(logsRes.logs || [])

                // Calculate stats
                const logs = logsRes.logs || []
                const total = logsRes.total || 0
                const avgIntensity = logs.length > 0
                    ? logs.reduce((sum: number, l: HeadacheLog) => sum + l.intensity, 0) / logs.length
                    : 0

                // Count logs from last 7 days
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                const lastWeekLogs = logs.filter((l: HeadacheLog) => new Date(l.date) >= weekAgo)

                setStats({
                    totalLogs: total,
                    avgIntensity: Math.round(avgIntensity * 10) / 10,
                    lastWeekCount: lastWeekLogs.length,
                    trend: lastWeekLogs.length > 3 ? 'up' : lastWeekLogs.length < 2 ? 'down' : 'stable',
                })
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const getIntensityColor = (intensity: number) => {
        if (intensity <= 3) return '#22C55E'
        if (intensity <= 6) return '#F59E0B'
        if (intensity <= 8) return '#F97316'
        return '#EF4444'
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return date.toLocaleDateString('zh-TW', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

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

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入資料中...</p>
                </div>
            ) : (
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
                        <div className="stat-icon">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats?.totalLogs || 0}</span>
                            <span className="stat-label">總記錄數</span>
                        </div>
                    </div>

                    <div className="bento-item stat-card">
                        <div className="stat-icon">
                            <Activity size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats?.avgIntensity || 0}</span>
                            <span className="stat-label">平均強度</span>
                        </div>
                        <div className={`stat-trend ${stats?.trend}`}>
                            {stats?.trend === 'up' ? (
                                <>
                                    <TrendingUp size={16} />
                                    <span>上升</span>
                                </>
                            ) : stats?.trend === 'down' ? (
                                <>
                                    <TrendingDown size={16} />
                                    <span>下降</span>
                                </>
                            ) : (
                                <span>穩定</span>
                            )}
                        </div>
                    </div>

                    {/* Weather Card */}
                    <div className="bento-item weather-card">
                        <div className="weather-header">
                            <Cloud size={20} />
                            <span>天氣狀況</span>
                        </div>
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
                                    <div className="weather-detail">
                                        <Droplets size={16} />
                                        <span>{weather.humidity}%</span>
                                    </div>
                                    <div className="weather-detail">
                                        <Gauge size={16} />
                                        <span>{weather.pressure} hPa</span>
                                    </div>
                                    <div className="weather-detail">
                                        <Wind size={16} />
                                        <span>{weather.windSpeed} m/s</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Air Quality Card */}
                    <div className="bento-item airquality-card">
                        <div className="weather-header">
                            <Wind size={20} />
                            <span>空氣品質</span>
                        </div>
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
                            <Link href="/diary" className="btn btn-ghost btn-sm">
                                查看全部
                            </Link>
                        </div>
                        {recentLogs.length > 0 ? (
                            <div className="logs-list">
                                {recentLogs.map(log => (
                                    <Link
                                        key={log.id}
                                        href={`/diary/${log.id}`}
                                        className="log-item"
                                    >
                                        <div
                                            className="log-intensity"
                                            style={{ backgroundColor: getIntensityColor(log.intensity) }}
                                        >
                                            {log.intensity}
                                        </div>
                                        <div className="log-info">
                                            <span className="log-date">{formatDate(log.date)}</span>
                                            <span className="log-location">{log.location || '未指定位置'}</span>
                                        </div>
                                        {log.duration && (
                                            <div className="log-duration">
                                                {log.duration} 分鐘
                                            </div>
                                        )}
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <AlertTriangle size={32} />
                                <p>尚無記錄</p>
                                <Link href="/diary/new" className="btn btn-secondary btn-sm">
                                    新增第一筆記錄
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Tips Card */}
                    <div className="bento-item bento-span-2 tips-card">
                        <h3>💡 健康小提醒</h3>
                        <p>
                            規律的睡眠、充足的水分攝取、適度的運動都有助於減少頭痛發作。
                            持續記錄您的頭痛模式，有助於發現可能的觸發因素。
                        </p>
                    </div>
                </div>
            )}

            <style jsx>{`
        .dashboard-page {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-8);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .dashboard-grid {
          grid-auto-rows: minmax(160px, auto);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          gap: var(--space-4);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Quick Record Card */
        .quick-record-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }

        .quick-record-content {
          position: relative;
          z-index: 1;
        }

        .quick-record-content h3 {
          margin-bottom: var(--space-2);
        }

        .quick-record-content p {
          margin-bottom: var(--space-4);
        }

        .quick-record-visual {
          position: absolute;
          right: var(--space-8);
          width: 120px;
          height: 120px;
        }

        .pulse-ring {
          position: absolute;
          inset: 0;
          border: 2px solid var(--color-primary);
          border-radius: 50%;
          opacity: 0;
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0% { transform: scale(0.5); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }

        /* Stat Cards */
        .stat-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-lg);
          color: var(--color-primary-light);
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-text-primary);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .stat-trend {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.75rem;
          margin-top: auto;
        }

        .stat-trend.up { color: #EF4444; }
        .stat-trend.down { color: #22C55E; }
        .stat-trend.stable { color: var(--color-text-muted); }

        /* Weather Card */
        .weather-card,
        .airquality-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .weather-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .weather-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .weather-main {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .weather-icon-large {
          color: #FBBF24;
        }

        .weather-temp {
          display: flex;
          flex-direction: column;
        }

        .temp-value {
          font-size: 2.5rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .temp-desc {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .weather-details {
          display: flex;
          gap: var(--space-4);
        }

        .weather-detail {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        /* Air Quality Card */
        .airquality-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .aqi-badge {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          padding: var(--space-4);
          border-radius: var(--radius-lg);
          width: fit-content;
        }

        .aqi-value {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .aqi-label {
          font-size: 0.875rem;
          font-weight: 500;
        }

        .pm25-info {
          display: flex;
          gap: var(--space-2);
          align-items: center;
        }

        .pm25-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .pm25-value {
          font-size: 0.875rem;
        }

        /* Recent Logs */
        .recent-logs-card {
          display: flex;
          flex-direction: column;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-4);
        }

        .card-header h3 {
          margin: 0;
        }

        .logs-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .log-item {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-3);
          background: var(--color-bg-glass);
          border-radius: var(--radius-md);
          text-decoration: none;
          transition: background var(--transition-fast);
        }

        .log-item:hover {
          background: var(--color-bg-card-hover);
        }

        .log-intensity {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          font-weight: 600;
          color: white;
        }

        .log-info {
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .log-date {
          font-size: 0.875rem;
          color: var(--color-text-primary);
        }

        .log-location {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .log-duration {
          font-size: 0.75rem;
          color: var(--color-text-secondary);
          padding: var(--space-1) var(--space-3);
          background: var(--color-bg-glass);
          border-radius: var(--radius-full);
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
          color: var(--color-text-muted);
          gap: var(--space-4);
        }

        /* Tips Card */
        .tips-card {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1));
          border-color: rgba(34, 197, 94, 0.2);
        }

        .tips-card h3 {
          margin-bottom: var(--space-3);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .quick-record-visual {
            display: none;
          }
        }
      `}</style>
        </div>
    )
}
