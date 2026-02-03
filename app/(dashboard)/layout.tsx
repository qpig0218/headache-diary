import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import Sidebar from '@/app/components/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const user = await getSession()
    if (!user) redirect('/login')

    return (
        <div className="dashboard-layout">
            <Sidebar user={user} />
            <main className="main-content">
                {children}
            </main>
        </div>
    )
}
