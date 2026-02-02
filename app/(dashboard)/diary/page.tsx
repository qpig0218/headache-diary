'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
    Plus,
    Search,
    Filter,
    Calendar,
    ChevronLeft,
    ChevronRight,
    Activity,
} from 'lucide-react'

interface HeadacheLog {
    id: string
    date: string
    intensity: number
    location: string | null
    duration: number | null
    notes: string | null
    triggers: { triggerType: string; value: string }[]
}

export default function DiaryPage() {
    const [logs, setLogs] = useState<HeadacheLog[]>([])
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const limit = 10

    useEffect(() => {
        setLoading(true)
        fetch(`/api/headaches?limit=${limit}&offset=${(page - 1) * limit}`)
            .then(r => r.json())
            .then(data => {
                setLogs(data.logs || [])
                setTotal(data.total || 0)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [page])

    const getIntensityColor = (intensity: number) => {
        if (intensity <= 3) return '#22C55E'
        if (intensity <= 6) return '#F59E0B'
        if (intensity <= 8) return '#F97316'
        return '#EF4444'
    }

    const getIntensityLabel = (intensity: number) => {
        if (intensity <= 3) return '輕微'
        if (intensity <= 6) return '中度'
        if (intensity <= 8) return '嚴重'
        return '劇烈'
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return {
            date: date.toLocaleDateString('zh-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            }),
            time: date.toLocaleTimeString('zh-TW', {
                hour: '2-digit',
                minute: '2-digit',
            }),
            weekday: date.toLocaleDateString('zh-TW', { weekday: 'short' }),
        }
    }

    const totalPages = Math.ceil(total / limit)

    const filteredLogs = searchQuery
        ? logs.filter(log =>
            log.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.triggers.some(t => t.value.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        : logs

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

            {/* Search & Filter */}
            <div className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="搜尋記錄..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} />
                    篩選
                </button>
            </div>

            {/* Stats Summary */}
            <div className="stats-summary">
                <div className="stat-item">
                    <span className="stat-number">{total}</span>
                    <span className="stat-text">總記錄</span>
                </div>
                <div className="stat-item">
                    <span className="stat-number">
                        {logs.length > 0
                            ? Math.round(logs.reduce((s, l) => s + l.intensity, 0) / logs.length * 10) / 10
                            : 0}
                    </span>
                    <span className="stat-text">平均強度</span>
                </div>
            </div>

            {/* Logs List */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入中...</p>
                </div>
            ) : filteredLogs.length > 0 ? (
                <div className="logs-grid">
                    {filteredLogs.map(log => {
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
                                    {log.notes && (
                                        <p className="log-notes">{log.notes}</p>
                                    )}
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

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        <ChevronLeft size={18} />
                        上一頁
                    </button>
                    <span className="page-info">
                        第 {page} 頁，共 {totalPages} 頁
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        下一頁
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <style jsx>{`
        .diary-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-6);
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .search-bar {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper svg {
          position: absolute;
          left: var(--space-4);
          color: var(--color-text-muted);
        }

        .search-input-wrapper .form-input {
          padding-left: calc(var(--space-4) + 18px + var(--space-3));
        }

        .stats-summary {
          display: flex;
          gap: var(--space-8);
          margin-bottom: var(--space-8);
          padding: var(--space-4);
          background: var(--color-bg-card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-primary-light);
        }

        .stat-text {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
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
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .logs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: var(--space-4);
        }

        .log-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          text-decoration: none;
          transition: all var(--transition-base);
        }

        .log-card:hover {
          background: var(--color-bg-card-hover);
          border-color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-glow);
        }

        .log-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-4);
        }

        .log-date-info {
          display: flex;
          flex-direction: column;
        }

        .log-date {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .log-weekday {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .intensity-badge {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 600;
          border: 1px solid;
        }

        .intensity-label {
          font-size: 0.75rem;
          font-weight: 400;
        }

        .log-card-body {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .log-location,
        .log-duration {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .label {
          color: var(--color-text-muted);
        }

        .log-notes {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin-top: var(--space-2);
        }

        .log-triggers {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin-top: var(--space-3);
        }

        .trigger-tag {
          padding: var(--space-1) var(--space-3);
          background: rgba(99, 102, 241, 0.1);
          color: var(--color-primary-light);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
        }

        .trigger-more {
          padding: var(--space-1) var(--space-3);
          background: var(--color-bg-glass);
          color: var(--color-text-muted);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: var(--space-16);
          gap: var(--space-4);
          color: var(--color-text-muted);
          text-align: center;
        }

        .empty-state h3 {
          color: var(--color-text-primary);
          margin-bottom: 0;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          margin-top: var(--space-8);
        }

        .page-info {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .page-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-bar {
            flex-direction: column;
          }

          .logs-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </div>
    )
}
