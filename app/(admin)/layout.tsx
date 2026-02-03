import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Link from 'next/link'
import {
    Brain,
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    ChevronLeft,
    Shield,
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getSession()
    if (!user) redirect('/login')
    if (user.role !== 'admin') redirect('/dashboard')

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: '管理總覽' },
        { href: '/admin/users', icon: Users, label: '用戶管理' },
        { href: '/admin/reports', icon: FileText, label: '系統報表' },
        { href: '/admin/settings', icon: Settings, label: '系統設定' },
    ]

    return (
        <div className="dashboard-layout">
            {/* Header */}
            <header className="header admin-header">
                <div className="header-left">
                    <Link href="/admin" className="logo">
                        <Brain className="icon-lg icon-gradient" />
                        <span className="logo-text">智能頭痛日記</span>
                        <span className="admin-badge">
                            <Shield size={14} />
                            管理後台
                        </span>
                    </Link>
                </div>

                <div className="header-right">
                    <Link href="/dashboard" className="btn btn-ghost btn-sm">
                        <ChevronLeft size={16} />
                        返回前台
                    </Link>
                    <div className="user-menu">
                        <div className="user-avatar">
                            {user.name?.[0] || user.email[0] || 'A'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name || '管理員'}</span>
                            <span className="user-role">系統管理員</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className="sidebar admin-sidebar">
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <div key={item.href} className="sidebar-item">
                            <Link href={item.href} className="sidebar-link">
                                <item.icon className="icon" />
                                <span>{item.label}</span>
                            </Link>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <form action={logoutAction}>
                        <button type="submit" className="sidebar-link">
                            <LogOut className="icon" />
                            <span>登出</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}
