import Link from 'next/link'
import { Brain, CheckCircle } from 'lucide-react'
import RegisterForm from '@/app/components/RegisterForm'

export default function RegisterPage() {
    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <Link href="/" className="auth-logo">
                        <Brain className="icon-lg icon-gradient" />
                        <span>智能頭痛日記</span>
                    </Link>

                    <h1>建立帳號</h1>
                    <p className="auth-subtitle">免費開始追蹤您的頭痛模式</p>

                    <RegisterForm />

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
        </div>
    )
}
