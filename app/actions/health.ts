'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function importHealthFile(prevState: any, formData: FormData) {
    const user = await getSession()
    if (!user) {
        return { error: '未登入' }
    }

    const file = formData.get('file') as File | null
    if (!file) {
        return { error: '請選擇檔案' }
    }

    const filename = file.name
    const ext = filename.split('.').pop()?.toLowerCase()

    if (!ext || !['csv', 'json'].includes(ext)) {
        return { error: '僅支援 CSV 或 JSON 格式' }
    }

    try {
        const text = await file.text()
        let records: Array<Record<string, any>> = []

        if (ext === 'csv') {
            const lines = text.trim().split('\n')
            if (lines.length < 2) {
                return { error: 'CSV 檔案格式不正確' }
            }
            const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
            records = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
                const row: Record<string, string> = {}
                headers.forEach((h, i) => { row[h] = values[i] || '' })
                return row
            })
        } else {
            const parsed = JSON.parse(text)
            records = Array.isArray(parsed) ? parsed : parsed.data || []
        }

        const importRecord = await prisma.healthImport.create({
            data: {
                userId: user.id,
                filename,
                format: ext,
                recordCount: 0,
                status: 'processing',
            },
        })

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

        const validTypes = ['sleep', 'heartRate', 'steps', 'bloodPressure', 'bodyTemp', 'bloodOxygen']
        let imported = 0
        const errors: string[] = []

        for (let i = 0; i < records.length; i++) {
            const row = records[i]
            const rawType = row.type || row.dataType || row.Type || ''
            const mappedType = typeMap[rawType] || rawType
            const value = parseFloat(row.value || row.Value || '0')
            const unit = row.unit || row.Unit || 'unknown'
            const startDate = row.startDate || row.StartDate || row.date || row.Date || ''

            if (!validTypes.includes(mappedType) || isNaN(value) || !startDate) {
                errors.push(`第 ${i + 1} 行: 無法解析`)
                continue
            }

            await prisma.healthData.create({
                data: {
                    userId: user.id,
                    dataType: mappedType,
                    value,
                    unit,
                    startDate: new Date(startDate),
                    endDate: row.endDate ? new Date(row.endDate) : null,
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

        return {
            success: true,
            importId: importRecord.id,
            recordCount: imported,
            errorCount: errors.length,
        }
    } catch (error) {
        console.error('Health import error:', error)
        return { error: '匯入失敗，請確認檔案格式正確' }
    }
}
