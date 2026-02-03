import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '100')

    const where: any = { userId: user.id }

    if (type) {
        where.dataType = type
    }

    if (from || to) {
        where.startDate = {}
        if (from) where.startDate.gte = new Date(from)
        if (to) where.startDate.lte = new Date(to)
    }

    try {
        const [data, total] = await Promise.all([
            prisma.healthData.findMany({
                where,
                orderBy: { startDate: 'desc' },
                take: Math.min(limit, 500),
            }),
            prisma.healthData.count({ where }),
        ])

        return NextResponse.json({
            data: data.map(d => ({
                ...d,
                metadata: d.metadata ? JSON.parse(d.metadata) : null,
            })),
            total,
        })
    } catch (error) {
        console.error('Health data query error:', error)
        return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
    }
}
