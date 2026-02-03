import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import crypto from 'crypto'

export async function GET() {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const devices = await prisma.ioTDevice.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { readings: true } },
        },
    })

    return NextResponse.json({ devices })
}

export async function POST(request: NextRequest) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { name, type } = await request.json()

        if (!name || !type) {
            return NextResponse.json({ error: '請提供裝置名稱與類型' }, { status: 400 })
        }

        const validTypes = ['env_sensor', 'wearable', 'air_quality', 'custom']
        if (!validTypes.includes(type)) {
            return NextResponse.json({ error: '無效的裝置類型' }, { status: 400 })
        }

        const apiKey = `iot_${crypto.randomUUID().replace(/-/g, '')}`

        const device = await prisma.ioTDevice.create({
            data: {
                userId: user.id,
                name,
                type,
                apiKey,
            },
        })

        return NextResponse.json({ device }, { status: 201 })
    } catch (error) {
        console.error('IoT device creation error:', error)
        return NextResponse.json({ error: '建立裝置失敗' }, { status: 500 })
    }
}
