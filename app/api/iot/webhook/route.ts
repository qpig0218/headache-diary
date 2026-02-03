import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateDevice } from '@/lib/iot-auth'

export async function POST(request: NextRequest) {
    const device = await authenticateDevice(request)
    if (!device) {
        return NextResponse.json({ error: 'Invalid or inactive API key' }, { status: 401 })
    }

    try {
        const body = await request.json()

        // Support single reading or array of readings
        const readings = Array.isArray(body.readings)
            ? body.readings
            : body.dataType
                ? [body]
                : []

        if (readings.length === 0) {
            return NextResponse.json({ error: 'No readings provided' }, { status: 400 })
        }

        const validTypes = ['temperature', 'humidity', 'pressure', 'heartRate', 'pm25', 'noise', 'bloodPressure', 'bloodOxygen', 'steps']

        let received = 0
        for (const reading of readings) {
            const { dataType, value, unit, timestamp, metadata } = reading

            if (!dataType || value === undefined || !unit) continue
            if (!validTypes.includes(dataType)) continue

            await prisma.deviceReading.create({
                data: {
                    deviceId: device.id,
                    dataType,
                    value: parseFloat(value),
                    unit,
                    timestamp: timestamp ? new Date(timestamp) : new Date(),
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            })
            received++
        }

        // Update device lastSeen
        await prisma.ioTDevice.update({
            where: { id: device.id },
            data: { lastSeen: new Date() },
        })

        return NextResponse.json({ received })
    } catch (error) {
        console.error('IoT webhook error:', error)
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
    }
}
