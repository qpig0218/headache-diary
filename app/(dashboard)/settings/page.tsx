import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SettingsForm from '@/app/components/SettingsForm'

export default async function SettingsPage() {
    const user = await getSession()
    if (!user) redirect('/login')

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">設定</h1>
                <p className="page-description">管理您的帳號與偏好設定</p>
            </div>

            <SettingsForm profile={user} />
        </div>
    )
}
