import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { data } = body

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ error: '請提供健康數據陣列' }, { status: 400 })
        }

        const errors: string[] = []
        let imported = 0

        for (let i = 0; i < data.length; i++) {
            const item = data[i]
            const { dataType, value, unit, startDate, endDate } = item

            if (!dataType || value === undefined || !unit || !startDate) {
                errors.push(`第 ${i + 1} 筆資料缺少必要欄位`)
                continue
            }

            const validTypes = ['sleep', 'heartRate', 'steps', 'bloodPressure', 'bodyTemp', 'bloodOxygen']
            if (!validTypes.includes(dataType)) {
                errors.push(`第 ${i + 1} 筆資料類型無效: ${dataType}`)
                continue
            }

            await prisma.healthData.create({
                data: {
                    userId: user.id,
                    dataType,
                    value: parseFloat(value),
                    unit,
                    startDate: new Date(startDate),
                    endDate: endDate ? new Date(endDate) : null,
                    source: 'apple_health',
                    metadata: item.metadata ? JSON.stringify(item.metadata) : null,
                },
            })
            imported++
        }

        return NextResponse.json({ imported, errors })
    } catch (error) {
        console.error('Apple Health sync error:', error)
        return NextResponse.json({ error: '同步失敗' }, { status: 500 })
    }
}
