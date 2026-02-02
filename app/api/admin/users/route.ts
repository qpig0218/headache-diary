import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        await requireAdmin()

        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '10')
        const offset = parseInt(searchParams.get('offset') || '0')

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    _count: {
                        select: {
                            headacheLogs: true,
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.user.count(),
        ])

        return NextResponse.json({
            users,
            total,
            limit,
            offset,
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
            return NextResponse.json(
                { error: error.message },
                { status: error.message === 'Forbidden' ? 403 : 401 }
            )
        }
        console.error('Admin users error:', error)
        return NextResponse.json(
            { error: 'Failed to fetch users' },
            { status: 500 }
        )
    }
}
