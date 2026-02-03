import Link from 'next/link'
import { Brain } from 'lucide-react'
import LoginForm from '@/app/components/LoginForm'

export default function LoginPage() {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <Link href="/" className="auth-logo">
                        <Brain className="icon-lg icon-gradient" />
                        <span>智能頭痛日記</span>
                    </Link>

                    <h1>歡迎回來</h1>
                    <p className="auth-subtitle">登入您的帳號以繼續</p>

                    <LoginForm />

                    <p className="auth-footer">
                        還沒有帳號？{' '}
                        <Link href="/register">立即註冊</Link>
                    </p>

                    <div className="demo-credentials">
                        <p>測試帳號：</p>
                        <p><strong>一般用戶：</strong> user@example.com / password123</p>
                        <p><strong>管理員：</strong> admin@example.com / admin123</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
