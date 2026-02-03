import {
    BarChart3,
    TrendingUp,
    Calendar,
    Activity,
    Cloud,
    Wind,
    PieChart,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function AnalyticsPage() {
    const user = await getSession()
    if (!user) redirect('/login')

    // Fetch all logs server-side
    const logs = await prisma.headacheLog.findMany({
        where: { userId: user.id },
        include: { triggers: true },
        orderBy: { date: 'desc' },
    })

    // Calculate all stats server-side
    if (logs.length === 0) {
        return (
            <div className="analytics-page">
                <div className="page-header">
                    <div>
                        <h1 className="page-title">數據分析</h1>
                        <p className="page-description">了解您的頭痛模式與觸發因素</p>
                    </div>
                </div>
                <div className="empty-state">
                    <BarChart3 size={48} />
                    <h3>尚無數據</h3>
                    <p>開始記錄您的頭痛，累積足夠數據後即可查看分析報表。</p>
                </div>
            </div>
        )
    }

    const totalLogs = logs.length
    const avgIntensity = Math.round(logs.reduce((s, l) => s + l.intensity, 0) / totalLogs * 10) / 10

    // Location stats
    const locationCounts: Record<string, number> = {}
    logs.forEach(l => { if (l.location) locationCounts[l.location] = (locationCounts[l.location] || 0) + 1 })
    const locationStats = Object.entries(locationCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    const mostCommonLocation = locationStats[0]?.name || '未指定'

    // Trigger stats
    const triggerCounts: Record<string, number> = {}
    logs.forEach(l => { l.triggers.forEach(t => { triggerCounts[t.value] = (triggerCounts[t.value] || 0) + 1 }) })
    const triggerStats = Object.entries(triggerCounts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    const mostCommonTrigger = triggerStats[0]?.name || '未指定'

    // Weekly data
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六']
    const weeklyData = weekdays.map((day, i) => {
        const dayLogs = logs.filter(l => l.date.getDay() === i)
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
    const monthlyData = months.map((month, i) => ({
        month,
        count: logs.filter(l => l.date.getMonth() === i).length,
    }))

    const getMaxCount = (data: { count: number }[]) => Math.max(...data.map(d => d.count), 1)
    const peakDay = weeklyData.reduce((max, d) => d.count > max.count ? d : max)

    return (
        <div className="analytics-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">數據分析</h1>
                    <p className="page-description">了解您的頭痛模式與觸發因素</p>
                </div>
            </div>

            <div className="analytics-grid">
                {/* Summary Cards */}
                <div className="bento-item summary-card">
                    <div className="summary-icon"><Calendar size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-value">{totalLogs}</span>
                        <span className="summary-label">總記錄數</span>
                    </div>
                </div>

                <div className="bento-item summary-card">
                    <div className="summary-icon"><Activity size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-value">{avgIntensity}</span>
                        <span className="summary-label">平均強度</span>
                    </div>
                </div>

                <div className="bento-item summary-card">
                    <div className="summary-icon"><TrendingUp size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-value">{mostCommonTrigger}</span>
                        <span className="summary-label">最常見觸發因素</span>
                    </div>
                </div>

                <div className="bento-item summary-card">
                    <div className="summary-icon"><PieChart size={24} /></div>
                    <div className="summary-content">
                        <span className="summary-value">{mostCommonLocation}</span>
                        <span className="summary-label">最常見位置</span>
                    </div>
                </div>

                {/* Weekly Distribution */}
                <div className="bento-item bento-span-2 chart-card">
                    <h3>每週分佈</h3>
                    <div className="bar-chart">
                        {weeklyData.map(d => (
                            <div key={d.day} className="bar-item">
                                <div className="bar" style={{ height: `${(d.count / getMaxCount(weeklyData)) * 100}%`, minHeight: d.count > 0 ? '20px' : '4px' }}>
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
                        {monthlyData.map(d => (
                            <div key={d.month} className="bar-item">
                                <div className="bar" style={{ height: `${(d.count / getMaxCount(monthlyData)) * 100}%`, minHeight: d.count > 0 ? '20px' : '4px' }}>
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
                        {triggerStats.length > 0 ? (
                            triggerStats.slice(0, 8).map((t, i) => (
                                <div key={t.name} className="list-item">
                                    <span className="list-rank">{i + 1}</span>
                                    <span className="list-name">{t.name}</span>
                                    <div className="list-bar-container">
                                        <div className="list-bar" style={{ width: `${(t.count / triggerStats[0].count) * 100}%` }} />
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
                        {locationStats.length > 0 ? (
                            locationStats.slice(0, 6).map((l, i) => (
                                <div key={l.name} className="list-item">
                                    <span className="list-rank">{i + 1}</span>
                                    <span className="list-name">{l.name}</span>
                                    <div className="list-bar-container">
                                        <div className="list-bar" style={{ width: `${(l.count / locationStats[0].count) * 100}%` }} />
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
                    <h3>分析洞察</h3>
                    <div className="insights-content">
                        <div className="insight-item">
                            <Cloud size={20} />
                            <p>
                                您的頭痛在<strong>{peakDay.day}</strong>
                                發生頻率最高，可能與該日的活動模式有關。
                            </p>
                        </div>
                        {mostCommonTrigger !== '未指定' && (
                            <div className="insight-item">
                                <Activity size={20} />
                                <p>
                                    <strong>{mostCommonTrigger}</strong>是您最常見的觸發因素，
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
        </div>
    )
}
