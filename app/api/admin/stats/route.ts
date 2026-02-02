import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET() {
    try {
        await requireAdmin()

        const [totalUsers, totalLogs, recentUsers] = await Promise.all([
            prisma.user.count(),
            prisma.headacheLog.count(),
            prisma.user.count({
                where: {
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
                    },
                },
            }),
        ])

        // Count logs this month
        const startOfMonth = new Date()
        startOfMonth.setDate(1)
        startOfMonth.setHours(0, 0, 0, 0)

        const logsThisMonth = await prisma.headacheLog.count({
            where: {
                createdAt: {
                    gte: startOfMonth,
                },
            },
        })

        return NextResponse.json({
            stats: {
                totalUsers,
                totalLogs,
                activeUsers: recentUsers,
                logsThisMonth,
            },
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Forbidden' ? 403 : 401 }
            )
        }
        console.error('Admin stats error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch stats' },
            { status: 500 }
        )
    }
}
