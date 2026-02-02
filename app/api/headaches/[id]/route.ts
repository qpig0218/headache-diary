import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

// GET - Fetch a single headache log
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const log = await prisma.headacheLog.findFirst({
            where: { id, userId: user.id },
            include: { triggers: true },
        })

        if (!log) {
            return NextResponse.json({ error: '找不到記錄' }, { status: 404 })
        }

        return NextResponse.json({
            log: {
                ...log,
                weatherData: log.weatherData ? JSON.parse(log.weatherData) : null,
                airQualityData: log.airQualityData ? JSON.parse(log.airQualityData) : null,
            },
        })
    } catch (error) {
        console.error('Fetch headache error:', error)
        return NextResponse.json({ error: '無法取得記錄' }, { status: 500 })
    }
}

// PUT - Update a headache log
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()

        // Verify ownership
        const existing = await prisma.headacheLog.findFirst({
            where: { id, userId: user.id },
        })

        if (!existing) {
            return NextResponse.json({ error: '找不到記錄' }, { status: 404 })
        }

        const { date, intensity, location, duration, notes, triggers, weatherData, airQualityData } = body

        // Delete existing triggers
        await prisma.headacheTrigger.deleteMany({ where: { logId: id } })

        // Update log
        const log = await prisma.headacheLog.update({
            where: { id },
            data: {
                date: date ? new Date(date) : undefined,
                intensity,
                location,
                duration,
                notes,
                weatherData: weatherData ? JSON.stringify(weatherData) : undefined,
                airQualityData: airQualityData ? JSON.stringify(airQualityData) : undefined,
                triggers: triggers && triggers.length > 0 ? {
                    create: triggers.map((t: { type: string; value: string }) => ({
                        triggerType: t.type,
                        value: t.value,
                    })),
                } : undefined,
            },
            include: { triggers: true },
        })

        return NextResponse.json({ log })
    } catch (error) {
        console.error('Update headache error:', error)
        return NextResponse.json({ error: '無法更新記錄' }, { status: 500 })
    }
}

// DELETE - Delete a headache log
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getSession()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Verify ownership
        const existing = await prisma.headacheLog.findFirst({
            where: { id, userId: user.id },
        })

        if (!existing) {
            return NextResponse.json({ error: '找不到記錄' }, { status: 404 })
        }

        await prisma.headacheLog.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Delete headache error:', error)
        return NextResponse.json({ error: '無法刪除記錄' }, { status: 500 })
    }
}
