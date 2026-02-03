import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

function parseCSV(text: string): Array<Record<string, string>> {
    const lines = text.trim().split('\n')
    if (lines.length < 2) return []
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, i) => { row[h] = values[i] || '' })
        return row
    })
}

function mapHealthRecord(row: Record<string, string>) {
    // Support common Apple Health export formats
    const dataType = row.type || row.dataType || row.Type || ''
    const value = parseFloat(row.value || row.Value || '0')
    const unit = row.unit || row.Unit || ''
    const startDate = row.startDate || row.StartDate || row.date || row.Date || ''
    const endDate = row.endDate || row.EndDate || ''

    const typeMap: Record<string, string> = {
        'HKQuantityTypeIdentifierHeartRate': 'heartRate',
        'HKQuantityTypeIdentifierStepCount': 'steps',
        'HKCategoryTypeIdentifierSleepAnalysis': 'sleep',
        'HKQuantityTypeIdentifierBloodPressureSystolic': 'bloodPressure',
        'HKQuantityTypeIdentifierBodyTemperature': 'bodyTemp',
        'HKQuantityTypeIdentifierOxygenSaturation': 'bloodOxygen',
        'heartRate': 'heartRate',
        'steps': 'steps',
        'sleep': 'sleep',
        'bloodPressure': 'bloodPressure',
        'bodyTemp': 'bodyTemp',
        'bloodOxygen': 'bloodOxygen',
    }

    const mappedType = typeMap[dataType] || dataType
    const validTypes = ['sleep', 'heartRate', 'steps', 'bloodPressure', 'bodyTemp', 'bloodOxygen']

    if (!validTypes.includes(mappedType) || isNaN(value) || !startDate) {
        return null
    }

    return {
        dataType: mappedType,
        value,
        unit: unit || 'unknown',
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
    }
}

export async function POST(request: NextRequest) {
    const user = await getSession()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: '請上傳檔案' }, { status: 400 })
        }

        const filename = file.name
        const ext = filename.split('.').pop()?.toLowerCase()

        if (!ext || !['csv', 'json'].includes(ext)) {
            return NextResponse.json({ error: '僅支援 CSV 或 JSON 格式' }, { status: 400 })
        }

        const text = await file.text()
        let records: Array<Record<string, string>> = []

        if (ext === 'csv') {
            records = parseCSV(text)
        } else {
            const parsed = JSON.parse(text)
            records = Array.isArray(parsed) ? parsed : parsed.data || []
        }

        // Create import record
        const importRecord = await prisma.healthImport.create({
            data: {
                userId: user.id,
                filename,
                format: ext,
                recordCount: 0,
                status: 'processing',
            },
        })

        let imported = 0
        const errors: string[] = []

        for (let i = 0; i < records.length; i++) {
            const mapped = mapHealthRecord(records[i])
            if (!mapped) {
                errors.push(`第 ${i + 1} 行: 無法解析`)
                continue
            }

            await prisma.healthData.create({
                data: {
                    userId: user.id,
                    ...mapped,
                    source: 'apple_health',
                    sourceId: importRecord.id,
                },
            })
            imported++
        }

        await prisma.healthImport.update({
            where: { id: importRecord.id },
            data: {
                recordCount: imported,
                status: errors.length > 0 && imported === 0 ? 'failed' : 'completed',
                errors: errors.length > 0 ? JSON.stringify(errors.slice(0, 20)) : null,
            },
        })

        return NextResponse.json({
            importId: importRecord.id,
            recordCount: imported,
            status: 'completed',
            errors: errors.slice(0, 10),
        })
    } catch (error) {
        console.error('Apple Health import error:', error)
        return NextResponse.json({ error: '匯入失敗' }, { status: 500 })
    }
}
