'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    Brain,
    LayoutDashboard,
    BookOpen,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Plus,
} from 'lucide-react'
import { logoutAction } from '@/app/actions/auth'

interface SidebarProps {
    user: {
        id: string
        name: string | null
        email: string
        role: string
    }
}

export default function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const navItems = [
        { href: '/dashboard', icon: LayoutDashboard, label: '儀表板' },
        { href: '/diary', icon: BookOpen, label: '頭痛日記' },
        { href: '/analytics', icon: BarChart3, label: '數據分析' },
        { href: '/settings', icon: Settings, label: '設定' },
    ]

    return (
        <>
            {/* Header */}
            <header className="header">
                <div className="header-left">
                    <button
                        className="btn btn-icon mobile-menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                    <Link href="/dashboard" className="logo">
                        <Brain className="icon-lg icon-gradient" />
                        <span className="logo-text">智能頭痛日記</span>
                    </Link>
                </div>

                <div className="header-right">
                    <Link href="/diary/new" className="btn btn-primary btn-sm">
                        <Plus size={16} />
                        <span className="btn-text">新增記錄</span>
                    </Link>
                    <div className="user-menu">
                        <div className="user-avatar">
                            {user.name?.[0] || user.email[0] || 'U'}
                        </div>
                        <div className="user-info">
                            <span className="user-name">{user.name || '使用者'}</span>
                            <span className="user-role">{user.role === 'admin' ? '管理員' : '一般用戶'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
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

                {user.role === 'admin' && (
                    <div className="sidebar-section">
                        <div className="sidebar-section-title">管理功能</div>
                        <nav className="sidebar-nav">
                            <div className="sidebar-item">
                                <Link
                                    href="/admin"
                                    className={`sidebar-link ${pathname === '/admin' ? 'active' : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <LayoutDashboard className="icon" />
                                    <span>管理後台</span>
                                </Link>
                            </div>
                        </nav>
                    </div>
                )}

                <div className="sidebar-footer">
                    <form action={logoutAction}>
                        <button type="submit" className="sidebar-link">
                            <LogOut className="icon" />
                            <span>登出</span>
                        </button>
                    </form>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <style jsx>{`
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
          color: var(--color-text-muted);
        }

        .sidebar-section {
          margin-top: var(--space-8);
          padding-top: var(--space-8);
          border-top: 1px solid var(--color-border);
        }

        .sidebar-section-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 0 var(--space-4);
          margin-bottom: var(--space-4);
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

          .logo-text {
            display: none;
          }

          .btn-text {
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
        </>
    )
}
