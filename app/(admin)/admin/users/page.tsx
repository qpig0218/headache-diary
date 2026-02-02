'use client'

import { useEffect, useState } from 'react'
import {
    Search,
    Filter,
    MoreVertical,
    Shield,
    User,
    Trash2,
    Edit,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react'

interface UserData {
    id: string
    email: string
    name: string | null
    role: string
    createdAt: string
    _count?: {
        headacheLogs: number
    }
}

export default function UsersPage() {
    const [users, setUsers] = useState<UserData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [page, setPage] = useState(1)
    const [total, setTotal] = useState(0)
    const limit = 10

    useEffect(() => {
        setLoading(true)
        fetch(`/api/admin/users?limit=${limit}&offset=${(page - 1) * limit}`)
            .then(r => r.json())
            .then(data => {
                setUsers(data.users || [])
                setTotal(data.total || 0)
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [page])

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('zh-TW', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
    }

    const filteredUsers = searchQuery
        ? users.filter(u =>
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : users

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="users-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">用戶管理</h1>
                    <p className="page-description">管理系統中的所有用戶帳號</p>
                </div>
            </div>

            {/* Search & Filter */}
            <div className="toolbar">
                <div className="search-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="搜尋用戶..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <button className="btn btn-secondary">
                    <Filter size={18} />
                    篩選
                </button>
            </div>

            {/* Users Table */}
            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>載入中...</p>
                </div>
            ) : (
                <>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>用戶</th>
                                    <th>角色</th>
                                    <th>記錄數</th>
                                    <th>註冊日期</th>
                                    <th>操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div className={`user-avatar ${user.role === 'admin' ? 'admin' : ''}`}>
                                                        {user.name?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div className="user-info">
                                                        <span className="user-name">{user.name || '未命名'}</span>
                                                        <span className="user-email">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${user.role}`}>
                                                    {user.role === 'admin' ? (
                                                        <>
                                                            <Shield size={12} />
                                                            管理員
                                                        </>
                                                    ) : (
                                                        <>
                                                            <User size={12} />
                                                            一般用戶
                                                        </>
                                                    )}
                                                </span>
                                            </td>
                                            <td>{user._count?.headacheLogs || 0}</td>
                                            <td>{formatDate(user.createdAt)}</td>
                                            <td>
                                                <div className="action-buttons">
                                                    <button className="btn btn-ghost btn-icon" title="編輯">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className="btn btn-ghost btn-icon" title="刪除">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="empty-cell">
                                            沒有找到用戶
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

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
                                第 {page} 頁，共 {totalPages} 頁（{total} 筆）
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
                </>
            )}

            <style jsx>{`
        .users-page {
          max-width: 1200px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: var(--space-6);
        }

        .toolbar {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .search-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-wrapper svg {
          position: absolute;
          left: var(--space-4);
          color: var(--color-text-muted);
        }

        .search-wrapper .form-input {
          padding-left: calc(var(--space-4) + 18px + var(--space-3));
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

        .user-cell {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.875rem;
        }

        .user-avatar.admin {
          background: linear-gradient(135deg, #8B5CF6, #A855F7);
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
        }

        .user-email {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-3);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
        }

        .role-badge.admin {
          background: rgba(139, 92, 246, 0.15);
          color: #A78BFA;
        }

        .role-badge.user {
          background: var(--color-bg-glass);
          color: var(--color-text-secondary);
        }

        .action-buttons {
          display: flex;
          gap: var(--space-2);
        }

        .empty-cell {
          text-align: center;
          padding: var(--space-8) !important;
          color: var(--color-text-muted);
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          margin-top: var(--space-6);
        }

        .page-info {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .toolbar {
            flex-direction: column;
          }

          .table-container {
            overflow-x: auto;
          }

          .user-info {
            display: none;
          }
        }
      `}</style>
        </div>
    )
}
