'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Brain,
    LayoutDashboard,
    Users,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft,
    Shield,
} from 'lucide-react'

interface User {
    id: string
    email: string
    name: string | null
    role: string
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        // Check authentication and admin role
        fetch('/api/auth/me')
            .then(res => {
                if (!res.ok) throw new Error('Not authenticated')
                return res.json()
            })
            .then(data => {
                if (data.user.role !== 'admin') {
                    router.push('/dashboard')
                    return
                }
                setUser(data.user)
                setLoading(false)
            })
            .catch(() => {
                router.push('/login')
            })
    }, [router])

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
    }

    const navItems = [
        { href: '/admin', icon: LayoutDashboard, label: '管理總覽' },
        { href: '/admin/users', icon: Users, label: '用戶管理' },
        { href: '/admin/reports', icon: FileText, label: '系統報表' },
        { href: '/admin/settings', icon: Settings, label: '系統設定' },
    ]

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>載入中...</p>
                <style jsx>{`
          .loading-screen {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
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
        `}</style>
            </div>
        )
    }

    return (
        <div className="admin-layout">
            {/* Header */}
            <header className="header admin-header">
                <div className="header-left">
                    <button
                        className="btn btn-icon mobile-menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
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
                        <div className="user-avatar admin">
                            {user?.name?.[0] || user?.email?.[0] || 'A'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user?.name || '管理員'}</span>
                            <span className="user-role">系統管理員</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`sidebar admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <div key={item.href} className="sidebar-item">
                            <Link
                                href={item.href}
                                className={`sidebar-link ${pathname === item.href ? 'active' : ''}`}
                                onClick={() => setSidebarOpen(false)}
                            >
                                <item.icon className="icon" />
                                <span>{item.label}</span>
                            </Link>
                        </div>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <button className="sidebar-link" onClick={handleLogout}>
                        <LogOut className="icon" />
                        <span>登出</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="main-content admin-content">
                {children}
            </main>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <style jsx>{`
        .admin-layout {
          min-height: 100vh;
        }

        .admin-header {
          background: linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(99, 102, 241, 0.1));
          border-bottom-color: rgba(139, 92, 246, 0.2);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .mobile-menu-btn {
          display: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.125rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .admin-badge {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-3);
          background: rgba(139, 92, 246, 0.2);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          color: #A78BFA;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .user-menu {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-glass);
          border-radius: var(--radius-lg);
          cursor: pointer;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
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
          font-size: 0.875rem;
          font-weight: 500;
        }

        .user-role {
          font-size: 0.75rem;
          color: #A78BFA;
        }

        .admin-sidebar {
          background: linear-gradient(180deg, rgba(139, 92, 246, 0.05), rgba(15, 15, 35, 0.6));
          border-right-color: rgba(139, 92, 246, 0.15);
        }

        .admin-sidebar .sidebar-link.active {
          background: rgba(139, 92, 246, 0.15);
          color: #A78BFA;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: var(--space-8);
          border-top: 1px solid var(--color-border);
        }

        .sidebar-footer button {
          width: 100%;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
        }

        .sidebar-overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }

          .logo-text,
          .admin-badge {
            display: none;
          }

          .user-info {
            display: none;
          }

          .sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 90;
          }
        }
      `}</style>
        </div>
    )
}
