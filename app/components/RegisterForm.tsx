'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { registerAction } from '@/app/actions/auth'
import { Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={pending}
        >
            {pending ? '建立中...' : '建立帳號'}
            {!pending && <ArrowRight size={18} />}
        </button>
    )
}

export default function RegisterForm() {
    const [state, formAction] = useFormState(registerAction, null)

    return (
        <>
            {state?.error && (
                <div className="auth-error">
                    <AlertCircle size={18} />
                    <span>{state.error}</span>
                </div>
            )}

            <form action={formAction} className="auth-form">
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
                            required
                        />
                    </div>
                </div>

                <SubmitButton />
            </form>
        </>
    )
}
