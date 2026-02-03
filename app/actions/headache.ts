'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { fetchWeatherData, fetchAirQualityData } from '@/lib/env-data'

export async function createHeadacheAction(prevState: any, formData: FormData) {
    const user = await getSession()
    if (!user) {
        redirect('/login')
    }

    const date = formData.get('date') as string
    const intensity = parseInt(formData.get('intensity') as string)
    const location = formData.get('location') as string || null
    const duration = formData.get('duration') ? parseInt(formData.get('duration') as string) : null
    const notes = formData.get('notes') as string || null
    const triggersJson = formData.get('triggers') as string

    if (!date || !intensity) {
        return { error: '請填寫日期與疼痛強度' }
    }

    if (intensity < 1 || intensity > 10) {
        return { error: '疼痛強度必須在 1-10 之間' }
    }

    // Fetch weather and air quality on the server
    const [weatherData, airQualityData] = await Promise.all([
        fetchWeatherData(),
        fetchAirQualityData(),
    ])

    let triggers: { type: string; value: string }[] = []
    try {
        if (triggersJson) {
            triggers = JSON.parse(triggersJson)
        }
    } catch {
        // ignore parse errors
    }

    await prisma.headacheLog.create({
        data: {
            userId: user.id,
            date: new Date(date),
            intensity,
            location,
            duration,
            notes,
            weatherData: weatherData ? JSON.stringify(weatherData) : null,
            airQualityData: airQualityData ? JSON.stringify(airQualityData) : null,
            triggers: triggers.length > 0 ? {
                create: triggers.map(t => ({
                    triggerType: t.type,
                    value: t.value,
                })),
            } : undefined,
        },
    })

    redirect('/diary')
}
