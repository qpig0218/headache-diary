import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const device = await prisma.ioTDevice.findFirst({
        where: { id, userId: user.id },
        include: {
            _count: { select: { readings: true } },
            readings: {
                orderBy: { timestamp: 'desc' },
                take: 10,
            },
        },
    })

    if (!device) {
        return NextResponse.json({ error: '找不到裝置' }, { status: 404 })
    }

    return NextResponse.json({ device })
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.ioTDevice.findFirst({
        where: { id, userId: user.id },
    })

    if (!existing) {
        return NextResponse.json({ error: '找不到裝置' }, { status: 404 })
    }

    try {
        const body = await request.json()
        const { name, type, active } = body

        const device = await prisma.ioTDevice.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(type !== undefined && { type }),
                ...(active !== undefined && { active }),
            },
        })

        return NextResponse.json({ device })
    } catch (error) {
        console.error('IoT device update error:', error)
        return NextResponse.json({ error: '更新失敗' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const existing = await prisma.ioTDevice.findFirst({
        where: { id, userId: user.id },
    })

    if (!existing) {
        return NextResponse.json({ error: '找不到裝置' }, { status: 404 })
    }

    await prisma.ioTDevice.delete({ where: { id } })

    return NextResponse.json({ message: '裝置已刪除' })
}
