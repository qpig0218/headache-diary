'use client'

import { useEffect, useState } from 'react'
import {
    Users,
    FileText,
    Activity,
    TrendingUp,
    Calendar,
    BarChart3,
} from 'lucide-react'

interface SystemStats {
    totalUsers: number
    totalLogs: number
    activeUsers: number
    logsThisMonth: number
}

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<SystemStats>({
        totalUsers: 0,
        totalLogs: 0,
        activeUsers: 0,
        logsThisMonth: 0,
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch admin stats
        fetch('/api/admin/stats')
            .then(r => r.json())
            .then(data => {
                if (data.stats) {
                    setStats(data.stats)
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const statCards = [
        {
            icon: Users,
            label: '總用戶數',
            value: stats.totalUsers,
            change: '+12%',
            positive: true,
        },
        {
            icon: FileText,
            label: '總記錄數',
            value: stats.totalLogs,
            change: '+8%',
            positive: true,
        },
        {
            icon: Activity,
            label: '活躍用戶',
            value: stats.activeUsers,
            change: '+5%',
            positive: true,
        },
        {
            icon: Calendar,
            label: '本月記錄',
            value: stats.logsThisMonth,
            change: '-3%',
            positive: false,
        },
    ]

    return (
        <div className="admin-dashboard">
            <div className="page-header">
                <h1 className="page-title">管理總覽</h1>
                <p className="page-description">系統運行狀態與數據概覽</p>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入中...</p>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="stats-grid">
                        {statCards.map((stat, i) => (
                            <div key={i} className="stat-card">
                                <div className="stat-icon">
                                    <stat.icon size={24} />
                                </div>
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
                            <div className="card-header">
                                <h3>系統健康狀態</h3>
                            </div>
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
                            <div className="card-header">
                                <h3>最近活動</h3>
                            </div>
                            <div className="activity-list">
                                <div className="activity-item">
                                    <div className="activity-icon">
                                        <Users size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p>新用戶註冊</p>
                                        <span>2 分鐘前</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon">
                                        <FileText size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p>新增頭痛記錄</p>
                                        <span>15 分鐘前</span>
                                    </div>
                                </div>
                                <div className="activity-item">
                                    <div className="activity-icon">
                                        <Activity size={16} />
                                    </div>
                                    <div className="activity-content">
                                        <p>系統備份完成</p>
                                        <span>1 小時前</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            <style jsx>{`
        .admin-dashboard {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: var(--space-8);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          gap: var(--space-4);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--color-border);
          border-top-color: var(--color-secondary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.15);
          border-radius: var(--radius-lg);
          color: #A78BFA;
        }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          font-family: var(--font-display);
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .stat-change.positive {
          color: #4ADE80;
        }

        .stat-change.negative {
          color: #F87171;
        }

        .overview-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr;
          gap: var(--space-4);
        }

        .overview-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
          color: var(--color-text-secondary);
        }

        .card-header h3 {
          font-size: 1rem;
          color: var(--color-text-primary);
          margin: 0;
        }

        /* Fake Chart */
        .chart-placeholder {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .fake-chart {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 120px;
          gap: var(--space-2);
        }

        .fake-bar {
          flex: 1;
          background: linear-gradient(to top, #8B5CF6, #A78BFA);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          opacity: 0.8;
        }

        .chart-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Health Items */
        .health-items {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .health-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .health-indicator {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
        }

        .health-indicator.good {
          background: #4ADE80;
          box-shadow: 0 0 8px #4ADE80;
        }

        .health-indicator.warning {
          background: #FBBF24;
          box-shadow: 0 0 8px #FBBF24;
        }

        .health-indicator.error {
          background: #EF4444;
          box-shadow: 0 0 8px #EF4444;
        }

        .health-label {
          flex: 1;
          font-size: 0.875rem;
        }

        .health-status {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .activity-item {
          display: flex;
          gap: var(--space-3);
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-glass);
          border-radius: var(--radius-md);
          color: var(--color-text-muted);
        }

        .activity-content {
          display: flex;
          flex-direction: column;
        }

        .activity-content p {
          font-size: 0.875rem;
          margin: 0;
        }

        .activity-content span {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .overview-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    )
}
