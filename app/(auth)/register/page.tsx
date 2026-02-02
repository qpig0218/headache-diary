'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Brain, Mail, Lock, User, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'

export default function RegisterPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('密碼與確認密碼不相符')
            return
        }

        if (formData.password.length < 6) {
            setError('密碼至少需要 6 個字元')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || '註冊失敗')
            }

            // Redirect to login
            router.push('/login?registered=true')
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

                    <h1>建立帳號</h1>
                    <p className="auth-subtitle">免費開始追蹤您的頭痛模式</p>

                    {error && (
                        <div className="auth-error">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="name" className="form-label">姓名</label>
                            <div className="input-with-icon">
                                <User size={18} className="input-icon" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-input"
                                    placeholder="您的姓名"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">電子郵件</label>
                            <div className="input-with-icon">
                                <Mail size={18} className="input-icon" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-input"
                                    placeholder="your@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
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
                                    name="password"
                                    className="form-input"
                                    placeholder="至少 6 個字元"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    minLength={6}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword" className="form-label">確認密碼</label>
                            <div className="input-with-icon">
                                <Lock size={18} className="input-icon" />
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    className="form-input"
                                    placeholder="再次輸入密碼"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary btn-lg w-full"
                            disabled={loading}
                        >
                            {loading ? '建立中...' : '建立帳號'}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    {/* Features list */}
                    <div className="register-features">
                        <div className="feature-item">
                            <CheckCircle size={16} />
                            <span>完全免費使用</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={16} />
                            <span>自動整合天氣資料</span>
                        </div>
                        <div className="feature-item">
                            <CheckCircle size={16} />
                            <span>視覺化分析報表</span>
                        </div>
                    </div>

                    <p className="auth-footer">
                        已經有帳號？{' '}
                        <Link href="/login">立即登入</Link>
                    </p>
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

        .register-features {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          margin-bottom: var(--space-6);
          padding: var(--space-4);
          background: rgba(34, 197, 94, 0.05);
          border-radius: var(--radius-md);
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 0.875rem;
          color: #4ADE80;
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

        @media (max-width: 480px) {
          .auth-card {
            padding: var(--space-6);
          }
        }
      `}</style>
        </div>
    )
}
