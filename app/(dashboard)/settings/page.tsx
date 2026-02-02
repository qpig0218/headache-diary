'use client'

import { useState, useEffect } from 'react'
import {
    User,
    Bell,
    Shield,
    Database,
    Save,
    CheckCircle,
    Loader2,
} from 'lucide-react'

interface UserProfile {
    id: string
    name: string | null
    email: string
    role: string
}

interface TriggerSetting {
    id: string
    category: string
    name: string
    active: boolean
}

export default function SettingsPage() {
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [triggers, setTriggers] = useState<TriggerSetting[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    // Form state
    const [name, setName] = useState('')
    const [notifications, setNotifications] = useState({
        reminder: true,
        weatherAlert: true,
        weeklyReport: false,
    })

    useEffect(() => {
        // Fetch user profile
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                setProfile(data.user)
                setName(data.user.name || '')
            })
            .catch(console.error)
            .finally(() => setLoading(false))
    }, [])

    const handleProfileSave = async () => {
        setSaving(true)
        try {
            // In a real app, this would update the profile
            await new Promise(resolve => setTimeout(resolve, 1000))
            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch (error) {
            console.error(error)
        } finally {
            setSaving(false)
        }
    }

    const tabs = [
        { id: 'profile', label: '個人資料', icon: User },
        { id: 'notifications', label: '通知設定', icon: Bell },
        { id: 'triggers', label: '觸發因素', icon: Database },
        { id: 'privacy', label: '隱私與安全', icon: Shield },
    ]

    if (loading) {
        return (
            <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>載入中...</p>
                <style jsx>{`
          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 400px;
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
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">設定</h1>
                <p className="page-description">管理您的帳號與偏好設定</p>
            </div>

            <div className="settings-layout">
                {/* Sidebar Tabs */}
                <div className="settings-sidebar">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            <tab.icon size={18} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="settings-content">
                    {activeTab === 'profile' && (
                        <div className="settings-section">
                            <h2>個人資料</h2>
                            <p className="section-desc">更新您的個人資訊</p>

                            <div className="form-card">
                                <div className="form-group">
                                    <label className="form-label">姓名</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="您的姓名"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">電子郵件</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={profile?.email || ''}
                                        disabled
                                    />
                                    <p className="form-hint">電子郵件無法更改</p>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">帳號類型</label>
                                    <div className="badge badge-primary">
                                        {profile?.role === 'admin' ? '管理員' : '一般用戶'}
                                    </div>
                                </div>

                                <button
                                    className="btn btn-primary"
                                    onClick={handleProfileSave}
                                    disabled={saving}
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 size={18} className="spinner" />
                                            儲存中...
                                        </>
                                    ) : saved ? (
                                        <>
                                            <CheckCircle size={18} />
                                            已儲存
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            儲存變更
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div className="settings-section">
                            <h2>通知設定</h2>
                            <p className="section-desc">管理您想接收的通知類型</p>

                            <div className="form-card">
                                <div className="toggle-group">
                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>每日提醒</h4>
                                            <p>每日提醒您記錄頭痛狀況</p>
                                        </div>
                                        <button
                                            className={`toggle-btn ${notifications.reminder ? 'active' : ''}`}
                                            onClick={() => setNotifications(n => ({ ...n, reminder: !n.reminder }))}
                                        >
                                            <span className="toggle-handle" />
                                        </button>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>天氣警報</h4>
                                            <p>當天氣變化可能觸發頭痛時通知您</p>
                                        </div>
                                        <button
                                            className={`toggle-btn ${notifications.weatherAlert ? 'active' : ''}`}
                                            onClick={() => setNotifications(n => ({ ...n, weatherAlert: !n.weatherAlert }))}
                                        >
                                            <span className="toggle-handle" />
                                        </button>
                                    </div>

                                    <div className="toggle-item">
                                        <div className="toggle-info">
                                            <h4>週報摘要</h4>
                                            <p>每週發送頭痛統計摘要至您的信箱</p>
                                        </div>
                                        <button
                                            className={`toggle-btn ${notifications.weeklyReport ? 'active' : ''}`}
                                            onClick={() => setNotifications(n => ({ ...n, weeklyReport: !n.weeklyReport }))}
                                        >
                                            <span className="toggle-handle" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'triggers' && (
                        <div className="settings-section">
                            <h2>觸發因素設定</h2>
                            <p className="section-desc">自訂您想追蹤的頭痛觸發因素</p>

                            <div className="form-card">
                                <p className="info-text">
                                    此功能允許您自訂記錄頭痛時可選擇的觸發因素列表。
                                    您可以啟用或停用預設的觸發因素，或新增自訂項目。
                                </p>

                                <div className="trigger-categories">
                                    {[
                                        { category: '飲食', items: ['咖啡因', '酒精', '巧克力', '起司'] },
                                        { category: '生活習慣', items: ['睡眠不足', '壓力', '運動'] },
                                        { category: '環境', items: ['強光', '噪音', '氣味'] },
                                    ].map(cat => (
                                        <div key={cat.category} className="trigger-category">
                                            <h4>{cat.category}</h4>
                                            <div className="trigger-list">
                                                {cat.items.map(item => (
                                                    <label key={item} className="trigger-item">
                                                        <input type="checkbox" defaultChecked />
                                                        <span>{item}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className="settings-section">
                            <h2>隱私與安全</h2>
                            <p className="section-desc">管理您的帳號安全設定</p>

                            <div className="form-card">
                                <div className="action-item">
                                    <div className="action-info">
                                        <h4>變更密碼</h4>
                                        <p>定期更換密碼以確保帳號安全</p>
                                    </div>
                                    <button className="btn btn-secondary">變更密碼</button>
                                </div>

                                <div className="action-item">
                                    <div className="action-info">
                                        <h4>匯出資料</h4>
                                        <p>下載您所有的頭痛記錄資料</p>
                                    </div>
                                    <button className="btn btn-secondary">匯出資料</button>
                                </div>

                                <div className="action-item danger">
                                    <div className="action-info">
                                        <h4>刪除帳號</h4>
                                        <p>永久刪除您的帳號與所有資料，此操作無法復原</p>
                                    </div>
                                    <button className="btn btn-danger">刪除帳號</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .settings-page {
          max-width: 1000px;
          margin: 0 auto;
        }

        .page-header {
          margin-bottom: var(--space-8);
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: var(--space-8);
        }

        .settings-sidebar {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-3) var(--space-4);
          background: transparent;
          border: none;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.9375rem;
          cursor: pointer;
          transition: all var(--transition-fast);
          text-align: left;
        }

        .tab-btn:hover {
          background: var(--color-bg-glass);
          color: var(--color-text-primary);
        }

        .tab-btn.active {
          background: rgba(99, 102, 241, 0.15);
          color: var(--color-primary-light);
        }

        .settings-section h2 {
          font-size: 1.25rem;
          margin-bottom: var(--space-2);
        }

        .section-desc {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
        }

        .form-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }

        .form-hint {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: var(--space-2);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Toggle Group */
        .toggle-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .toggle-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          background: var(--color-bg-glass);
          border-radius: var(--radius-lg);
        }

        .toggle-info h4 {
          font-size: 0.9375rem;
          margin-bottom: var(--space-1);
        }

        .toggle-info p {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .toggle-btn {
          width: 48px;
          height: 28px;
          padding: 2px;
          background: var(--color-border);
          border: none;
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: background var(--transition-fast);
        }

        .toggle-btn.active {
          background: var(--color-primary);
        }

        .toggle-handle {
          display: block;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: var(--radius-full);
          transition: transform var(--transition-fast);
        }

        .toggle-btn.active .toggle-handle {
          transform: translateX(20px);
        }

        /* Trigger Settings */
        .info-text {
          color: var(--color-text-secondary);
          margin-bottom: var(--space-6);
        }

        .trigger-categories {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .trigger-category h4 {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-bottom: var(--space-3);
        }

        .trigger-list {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
        }

        .trigger-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-glass);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-size: 0.875rem;
        }

        .trigger-item input {
          accent-color: var(--color-primary);
        }

        /* Action Items */
        .action-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-4);
          border-bottom: 1px solid var(--color-border);
        }

        .action-item:last-child {
          border-bottom: none;
        }

        .action-info h4 {
          font-size: 0.9375rem;
          margin-bottom: var(--space-1);
        }

        .action-info p {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .action-item.danger .action-info h4 {
          color: #EF4444;
        }

        .btn-danger {
          background: rgba(239, 68, 68, 0.1);
          color: #EF4444;
          border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .btn-danger:hover {
          background: rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 768px) {
          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: var(--space-4);
            border-bottom: 1px solid var(--color-border);
            margin-bottom: var(--space-4);
          }

          .tab-btn {
            white-space: nowrap;
          }

          .action-item {
            flex-direction: column;
            align-items: flex-start;
            gap: var(--space-4);
          }

          .action-item .btn {
            width: 100%;
          }
        }
      `}</style>
        </div>
    )
}
