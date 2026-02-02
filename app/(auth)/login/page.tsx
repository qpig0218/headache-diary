'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '登入失敗')
            }

            // Redirect based on role
            if (data.user.role === 'admin') {
                router.push('/admin')
            } else {
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    {/* Logo */}
                    <Link href="/" className="auth-logo">
                        <Brain className="icon-lg icon-gradient" />
                        <span>智能頭痛日記</span>
                    </Link>

                    <h1>歡迎回來</h1>
                    <p className="auth-subtitle">登入您的帳號以繼續</p>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email" className="form-label">電子郵件</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="password" className="form-label">密碼</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? '登入中...' : '登入'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <p className="auth-footer">
                        還沒有帳號？{' '}
                        <Link href="/register">立即註冊</Link>
                    </p>

                    {/* Demo credentials */}
                    <div className="demo-credentials">
                        <p>測試帳號：</p>
                        <p><strong>一般用戶：</strong> user@example.com / password123</p>
                        <p><strong>管理員：</strong> admin@example.com / admin123</p>
                    </div>
                </div>
            </div>

            <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-8);
        }

        .auth-container {
          width: 100%;
          max-width: 440px;
        }

        .auth-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          backdrop-filter: blur(20px);
        }

        .auth-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-3);
          margin-bottom: var(--space-8);
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          text-decoration: none;
        }

        .auth-card h1 {
          text-align: center;
          font-size: 1.75rem;
          margin-bottom: var(--space-2);
        }

        .auth-subtitle {
          text-align: center;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-8);
        }

        .auth-error {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          padding: var(--space-4);
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: var(--radius-md);
          color: #F87171;
          margin-bottom: var(--space-6);
          font-size: 0.875rem;
        }

        .auth-form {
          margin-bottom: var(--space-6);
        }

        .input-with-icon {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: var(--space-4);
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .input-with-icon .form-input {
          padding-left: calc(var(--space-4) + 18px + var(--space-3));
        }

        .auth-footer {
          text-align: center;
          color: var(--color-text-secondary);
          font-size: 0.875rem;
        }

        .auth-footer a {
          color: var(--color-primary-light);
          font-weight: 500;
        }

        .demo-credentials {
          margin-top: var(--space-6);
          padding: var(--space-4);
          background: rgba(99, 102, 241, 0.1);
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          color: var(--color-text-secondary);
        }

        .demo-credentials p {
          margin-bottom: var(--space-1);
        }

        .demo-credentials p:first-child {
          color: var(--color-primary-light);
          font-weight: 500;
        }

        @media (max-width: 480px) {
          .auth-card {
            padding: var(--space-6);
          }
        }
      `}</style>
        </div>
    )
}
