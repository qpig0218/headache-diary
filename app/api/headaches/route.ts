import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Fetch all headache logs for the current user
export async function GET(request: NextRequest) {
    try {
        const user = await getSession()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const searchParams = request.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const where: any = { userId: user.id }

        if (startDate || endDate) {
            where.date = {}
            if (startDate) where.date.gte = new Date(startDate)
            if (endDate) where.date.lte = new Date(endDate)
        }

        const [logs, total] = await Promise.all([
            prisma.headacheLog.findMany({
                where,
                include: {
                    triggers: true,
                },
                orderBy: { date: 'desc' },
                take: limit,
                skip: offset,
            }),
            prisma.headacheLog.count({ where }),
        ])

        return NextResponse.json({
            logs: logs.map(log => ({
                ...log,
                weatherData: log.weatherData ? JSON.parse(log.weatherData) : null,
                airQualityData: log.airQualityData ? JSON.parse(log.airQualityData) : null,
            })),
            total,
            limit,
            offset,
        })
    } catch (error) {
        console.error('Fetch headaches error:', error)
        return NextResponse.json(
            { error: '無法取得頭痛記錄' },
            { status: 500 }
        )
    }
}

// POST - Create a new headache log
export async function POST(request: NextRequest) {
    try {
        const user = await getSession()

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const {
            date,
            intensity,
            location,
            duration,
            notes,
            triggers,
            weatherData,
            airQualityData,
        } = body

        if (!date || !intensity) {
            return NextResponse.json(
                { error: '請填寫日期與疼痛強度' },
                { status: 400 }
            )
        }

        if (intensity < 1 || intensity > 10) {
            return NextResponse.json(
                { error: '疼痛強度必須在 1-10 之間' },
                { status: 400 }
            )
        }

        const log = await prisma.headacheLog.create({
            data: {
                userId: user.id,
                date: new Date(date),
                intensity,
                location: location || null,
                duration: duration || null,
                notes: notes || null,
                weatherData: weatherData ? JSON.stringify(weatherData) : null,
                airQualityData: airQualityData ? JSON.stringify(airQualityData) : null,
                triggers: triggers && triggers.length > 0 ? {
                    create: triggers.map((t: { type: string; value: string }) => ({
                        triggerType: t.type,
                        value: t.value,
                    })),
                } : undefined,
            },
            include: {
                triggers: true,
            },
        })

        return NextResponse.json({ log })
    } catch (error) {
        console.error('Create headache error:', error)
        return NextResponse.json(
            { error: '無法建立頭痛記錄' },
            { status: 500 }
        )
    }
}
