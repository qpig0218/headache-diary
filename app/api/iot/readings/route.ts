import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const deviceId = searchParams.get('deviceId')
    const type = searchParams.get('type')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Verify device ownership
    if (deviceId) {
        const device = await prisma.ioTDevice.findFirst({
            where: { id: deviceId, userId: user.id },
        })
        if (!device) {
            return NextResponse.json({ error: '找不到裝置' }, { status: 404 })
        }
    }

    const where: any = {
        device: { userId: user.id },
    }

    if (deviceId) where.deviceId = deviceId
    if (type) where.dataType = type
    if (from || to) {
        where.timestamp = {}
        if (from) where.timestamp.gte = new Date(from)
        if (to) where.timestamp.lte = new Date(to)
    }

    try {
        const [readings, total] = await Promise.all([
            prisma.deviceReading.findMany({
                where,
                orderBy: { timestamp: 'desc' },
                take: Math.min(limit, 500),
                include: {
                    device: { select: { name: true, type: true } },
                },
            }),
            prisma.deviceReading.count({ where }),
        ])

        return NextResponse.json({ readings, total })
    } catch (error) {
        console.error('IoT readings query error:', error)
        return NextResponse.json({ error: '查詢失敗' }, { status: 500 })
    }
}
