export const dynamic = 'force-dynamic'

import { Shield, User, Edit, Trash2 } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'
import UserSearch from '@/app/components/UserSearch'

function formatDate(date: Date) {
    return date.toLocaleDateString('zh-TW', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

export default async function UsersPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    await requireAdmin()

    const params = await searchParams
    const page = parseInt(params.page || '1')
    const searchQuery = params.q || ''
    const limit = 10
    const offset = (page - 1) * limit

    const where: any = {}
    if (searchQuery) {
        where.OR = [
            { email: { contains: searchQuery } },
            { name: { contains: searchQuery } },
        ]
    }

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
                _count: { select: { headacheLogs: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.user.count({ where }),
    ])

    const totalPages = Math.ceil(total / limit)

    return (
        <div className="users-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">用戶管理</h1>
                    <p className="page-description">管理系統中的所有用戶帳號</p>
                </div>
            </div>

            <UserSearch totalPages={totalPages} currentPage={page} total={total} />

            {/* Users Table */}
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
                        {users.length > 0 ? (
                            users.map(user => (
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
                                                <><Shield size={12} />管理員</>
                                            ) : (
                                                <><User size={12} />一般用戶</>
                                            )}
                                        </span>
                                    </td>
                                    <td>{user._count.headacheLogs}</td>
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
        </div>
    )
}
