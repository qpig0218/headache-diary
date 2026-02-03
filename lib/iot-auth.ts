import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function authenticateDevice(request: NextRequest) {
    const apiKey =
        request.headers.get('x-api-key') ||
        new URL(request.url).searchParams.get('key')

    if (!apiKey) {
        return null
    }

    const device = await prisma.ioTDevice.findUnique({
        where: { apiKey },
    })

    if (!device || !device.active) {
        return null
    }

    return device
}
