'use client'

import { useEffect, useState } from 'react'
import {
    BarChart3,
    TrendingUp,
    Calendar,
    Activity,
    Cloud,
    Wind,
    PieChart,
} from 'lucide-react'

interface HeadacheLog {
    id: string
    date: string
    intensity: number
    location: string | null
    triggers: { triggerType: string; value: string }[]
    weatherData: { temp: number; pressure: number; humidity: number } | null
    airQualityData: { aqi: number } | null
}

interface Stats {
    totalLogs: number
    avgIntensity: number
    mostCommonLocation: string
    mostCommonTrigger: string
    weeklyData: { day: string; count: number; avgIntensity: number }[]
    monthlyData: { month: string; count: number }[]
    triggerStats: { name: string; count: number }[]
    locationStats: { name: string; count: number }[]
}

export default function AnalyticsPage() {
    const [logs, setLogs] = useState<HeadacheLog[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')

    useEffect(() => {
        fetch('/api/headaches?limit=1000')
            .then(r => r.json())
            .then(data => {
                const fetchedLogs = data.logs || []
                setLogs(fetchedLogs)
                calculateStats(fetchedLogs)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const calculateStats = (logs: HeadacheLog[]) => {
        if (logs.length === 0) {
            setStats(null)
            return
        }

        // Total and average
        const totalLogs = logs.length
        const avgIntensity = logs.reduce((s, l) => s + l.intensity, 0) / totalLogs

        // Location stats
        const locationCounts: Record<string, number> = {}
        logs.forEach(l => {
            if (l.location) {
                locationCounts[l.location] = (locationCounts[l.location] || 0) + 1
            }
        })
        const locationStats = Object.entries(locationCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        const mostCommonLocation = locationStats[0]?.name || '未指定'

        // Trigger stats
        const triggerCounts: Record<string, number> = {}
        logs.forEach(l => {
            l.triggers.forEach(t => {
                triggerCounts[t.value] = (triggerCounts[t.value] || 0) + 1
            })
        })
        const triggerStats = Object.entries(triggerCounts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        const mostCommonTrigger = triggerStats[0]?.name || '未指定'

        // Weekly data
        const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
        const weeklyData = weekdays.map((day, i) => {
            const dayLogs = logs.filter(l => new Date(l.date).getDay() === i)
            return {
                day,
                count: dayLogs.length,
                avgIntensity: dayLogs.length > 0
                    ? Math.round(dayLogs.reduce((s, l) => s + l.intensity, 0) / dayLogs.length * 10) / 10
                    : 0,
            }
        })

        // Monthly data
        const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
        const monthlyData = months.map((month, i) => {
            const monthLogs = logs.filter(l => new Date(l.date).getMonth() === i)
            return { month, count: monthLogs.length }
        })

        setStats({
            totalLogs,
            avgIntensity: Math.round(avgIntensity * 10) / 10,
            mostCommonLocation,
            mostCommonTrigger,
            weeklyData,
            monthlyData,
            triggerStats: triggerStats.slice(0, 8),
            locationStats: locationStats.slice(0, 6),
        })
    }

    const getMaxCount = (data: { count: number }[]) => Math.max(...data.map(d => d.count), 1)

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">數據分析</h1>
                    <p className="page-description">了解您的頭痛模式與觸發因素</p>
                </div>
                <div className="time-range-selector">
                    {(['week', 'month', 'year'] as const).map(range => (
                        <button
                            key={range}
                            className={`range-btn ${timeRange === range ? 'active' : ''}`}
                            onClick={() => setTimeRange(range)}
                        >
                            {range === 'week' ? '本週' : range === 'month' ? '本月' : '今年'}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>分析數據中...</p>
                </div>
            ) : !stats ? (
                <div className="empty-state">
                    <BarChart3 size={48} />
                    <h3>尚無數據</h3>
                    <p>開始記錄您的頭痛，累積足夠數據後即可查看分析報表。</p>
                </div>
            ) : (
                <div className="analytics-grid">
                    {/* Summary Cards */}
                    <div className="bento-item summary-card">
                        <div className="summary-icon">
                            <Calendar size={24} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-value">{stats.totalLogs}</span>
                            <span className="summary-label">總記錄數</span>
                        </div>
                    </div>

                    <div className="bento-item summary-card">
                        <div className="summary-icon">
                            <Activity size={24} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-value">{stats.avgIntensity}</span>
                            <span className="summary-label">平均強度</span>
                        </div>
                    </div>

                    <div className="bento-item summary-card">
                        <div className="summary-icon">
                            <TrendingUp size={24} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-value">{stats.mostCommonTrigger}</span>
                            <span className="summary-label">最常見觸發因素</span>
                        </div>
                    </div>

                    <div className="bento-item summary-card">
                        <div className="summary-icon">
                            <PieChart size={24} />
                        </div>
                        <div className="summary-content">
                            <span className="summary-value">{stats.mostCommonLocation}</span>
                            <span className="summary-label">最常見位置</span>
                        </div>
                    </div>

                    {/* Weekly Distribution */}
                    <div className="bento-item bento-span-2 chart-card">
                        <h3>每週分佈</h3>
                        <div className="bar-chart">
                            {stats.weeklyData.map(d => (
                                <div key={d.day} className="bar-item">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(d.count / getMaxCount(stats.weeklyData)) * 100}%`,
                                            minHeight: d.count > 0 ? '20px' : '4px'
                                        }}
                                    >
                                        <span className="bar-value">{d.count}</span>
                                    </div>
                                    <span className="bar-label">{d.day}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bento-item bento-span-2 chart-card">
                        <h3>月度趨勢</h3>
                        <div className="bar-chart monthly-chart">
                            {stats.monthlyData.map(d => (
                                <div key={d.month} className="bar-item">
                                    <div
                                        className="bar"
                                        style={{
                                            height: `${(d.count / getMaxCount(stats.monthlyData)) * 100}%`,
                                            minHeight: d.count > 0 ? '20px' : '4px'
                                        }}
                                    >
                                        <span className="bar-value">{d.count}</span>
                                    </div>
                                    <span className="bar-label">{d.month}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Trigger Analysis */}
                    <div className="bento-item bento-span-2 list-card">
                        <h3>觸發因素分析</h3>
                        <div className="list-items">
                            {stats.triggerStats.length > 0 ? (
                                stats.triggerStats.map((t, i) => (
                                    <div key={t.name} className="list-item">
                                        <span className="list-rank">{i + 1}</span>
                                        <span className="list-name">{t.name}</span>
                                        <div className="list-bar-container">
                                            <div
                                                className="list-bar"
                                                style={{
                                                    width: `${(t.count / stats.triggerStats[0].count) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="list-count">{t.count} 次</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">尚無觸發因素記錄</p>
                            )}
                        </div>
                    </div>

                    {/* Location Analysis */}
                    <div className="bento-item bento-span-2 list-card">
                        <h3>疼痛位置分析</h3>
                        <div className="list-items">
                            {stats.locationStats.length > 0 ? (
                                stats.locationStats.map((l, i) => (
                                    <div key={l.name} className="list-item">
                                        <span className="list-rank">{i + 1}</span>
                                        <span className="list-name">{l.name}</span>
                                        <div className="list-bar-container">
                                            <div
                                                className="list-bar"
                                                style={{
                                                    width: `${(l.count / stats.locationStats[0].count) * 100}%`
                                                }}
                                            />
                                        </div>
                                        <span className="list-count">{l.count} 次</span>
                                    </div>
                                ))
                            ) : (
                                <p className="no-data">尚無位置記錄</p>
                            )}
                        </div>
                    </div>

                    {/* Insights */}
                    <div className="bento-item bento-span-4 insights-card">
                        <h3>💡 分析洞察</h3>
                        <div className="insights-content">
                            <div className="insight-item">
                                <Cloud size={20} />
                                <p>
                                    您的頭痛在<strong>{stats.weeklyData.reduce((max, d) => d.count > max.count ? d : max).day}</strong>
                                    發生頻率最高，可能與該日的活動模式有關。
                                </p>
                            </div>
                            {stats.mostCommonTrigger !== '未指定' && (
                                <div className="insight-item">
                                    <Activity size={20} />
                                    <p>
                                        <strong>{stats.mostCommonTrigger}</strong>是您最常見的觸發因素，
                                        建議留意相關活動並嘗試減少接觸。
                                    </p>
                                </div>
                            )}
                            <div className="insight-item">
                                <Wind size={20} />
                                <p>
                                    持續記錄有助於發現更多模式。建議每次頭痛發作時都詳細記錄環境因素。
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx>{`
        .analytics-page {
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

        .time-range-selector {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-1);
          background: var(--color-bg-glass);
          border-radius: var(--radius-lg);
        }

        .range-btn {
          padding: var(--space-2) var(--space-4);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .range-btn:hover {
          color: var(--color-text-primary);
        }

        .range-btn.active {
          background: var(--color-primary);
          color: white;
        }

        .loading-state,
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          gap: var(--space-4);
          color: var(--color-text-muted);
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

        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
        }

        /* Summary Cards */
        .summary-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .summary-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-lg);
          color: var(--color-primary-light);
        }

        .summary-content {
          display: flex;
          flex-direction: column;
        }

        .summary-value {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .summary-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        /* Chart Cards */
        .chart-card,
        .list-card,
        .insights-card {
          display: flex;
          flex-direction: column;
        }

        .chart-card h3,
        .list-card h3,
        .insights-card h3 {
          margin-bottom: var(--space-6);
          font-size: 1rem;
        }

        .bar-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 160px;
          gap: var(--space-2);
        }

        .monthly-chart {
          gap: var(--space-1);
        }

        .bar-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
        }

        .bar {
          flex: 1;
          width: 100%;
          max-width: 40px;
          background: linear-gradient(to top, var(--color-primary), var(--color-secondary));
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: var(--space-1);
          transition: height var(--transition-base);
        }

        .bar-value {
          font-size: 0.75rem;
          font-weight: 600;
          color: white;
        }

        .bar-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: var(--space-2);
        }

        /* List Cards */
        .list-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .list-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .list-rank {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-glass);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
        }

        .list-name {
          width: 120px;
          font-size: 0.875rem;
        }

        .list-bar-container {
          flex: 1;
          height: 8px;
          background: var(--color-bg-glass);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .list-bar {
          height: 100%;
          background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
          border-radius: var(--radius-full);
          transition: width var(--transition-base);
        }

        .list-count {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          width: 60px;
          text-align: right;
        }

        .no-data {
          color: var(--color-text-muted);
          font-size: 0.875rem;
          text-align: center;
          padding: var(--space-4);
        }

        /* Insights Card */
        .insights-card {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
        }

        .insights-content {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .insight-item {
          display: flex;
          gap: var(--space-3);
          align-items: flex-start;
        }

        .insight-item svg {
          flex-shrink: 0;
          color: var(--color-primary-light);
          margin-top: 2px;
        }

        .insight-item p {
          font-size: 0.9375rem;
          line-height: 1.6;
        }

        .insight-item strong {
          color: var(--color-primary-light);
        }

        @media (max-width: 1280px) {
          .analytics-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .bento-span-4 {
            grid-column: span 2;
          }
        }

        @media (max-width: 768px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }

          .bento-span-2,
          .bento-span-4 {
            grid-column: span 1;
          }

          .monthly-chart {
            overflow-x: auto;
          }

          .list-name {
            width: 80px;
          }
        }
      `}</style>
        </div>
    )
}
