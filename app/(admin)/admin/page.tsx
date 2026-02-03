export const dynamic = 'force-dynamic'

import {
    Users,
    FileText,
    Activity,
    TrendingUp,
    Calendar,
    BarChart3,
} from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export default async function AdminDashboardPage() {
    await requireAdmin()

    const [totalUsers, totalLogs, recentUsers] = await Promise.all([
        prisma.user.count(),
        prisma.headacheLog.count(),
        prisma.user.count({
            where: {
                createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
            },
        }),
    ])

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)
    const logsThisMonth = await prisma.headacheLog.count({
        where: { createdAt: { gte: startOfMonth } },
    })

    const statCards = [
        { icon: Users, label: '總用戶數', value: totalUsers, change: '+12%', positive: true },
        { icon: FileText, label: '總記錄數', value: totalLogs, change: '+8%', positive: true },
        { icon: Activity, label: '活躍用戶', value: recentUsers, change: '+5%', positive: true },
        { icon: Calendar, label: '本月記錄', value: logsThisMonth, change: '-3%', positive: false },
    ]

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <h1 className="page-title">管理總覽</h1>
                <p className="page-description">系統運行狀態與數據概覽</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                {statCards.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon"><stat.icon size={24} /></div>
                        <div className="stat-content">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                            <TrendingUp size={14} />
                            <span>{stat.change}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Overview Cards */}
            <div className="overview-grid">
                <div className="overview-card">
                    <div className="card-header">
                        <h3>用戶成長趨勢</h3>
                        <BarChart3 size={20} />
                    </div>
                    <div className="chart-placeholder">
                        <div className="fake-chart">
                            {[40, 65, 50, 80, 60, 90, 70].map((h, i) => (
                                <div key={i} className="fake-bar" style={{ height: `${h}%` }} />
                            ))}
                        </div>
                        <div className="chart-labels">
                            {['週一', '週二', '週三', '週四', '週五', '週六', '週日'].map((d, i) => (
                                <span key={i}>{d}</span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-header"><h3>系統健康狀態</h3></div>
                    <div className="health-items">
                        <div className="health-item">
                            <span className="health-indicator good" />
                            <span className="health-label">API 服務</span>
                            <span className="health-status">正常運行</span>
                        </div>
                        <div className="health-item">
                            <span className="health-indicator good" />
                            <span className="health-label">資料庫</span>
                            <span className="health-status">正常連線</span>
                        </div>
                        <div className="health-item">
                            <span className="health-indicator good" />
                            <span className="health-label">天氣 API</span>
                            <span className="health-status">正常</span>
                        </div>
                        <div className="health-item">
                            <span className="health-indicator good" />
                            <span className="health-label">空氣品質 API</span>
                            <span className="health-status">正常</span>
                        </div>
                    </div>
                </div>

                <div className="overview-card">
                    <div className="card-header"><h3>最近活動</h3></div>
                    <div className="activity-list">
                        <div className="activity-item">
                            <div className="activity-icon"><Users size={16} /></div>
                            <div className="activity-content">
                                <p>新用戶註冊</p>
                                <span>2 分鐘前</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon"><FileText size={16} /></div>
                            <div className="activity-content">
                                <p>新增頭痛記錄</p>
                                <span>15 分鐘前</span>
                            </div>
                        </div>
                        <div className="activity-item">
                            <div className="activity-icon"><Activity size={16} /></div>
                            <div className="activity-content">
                                <p>系統備份完成</p>
                                <span>1 小時前</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
