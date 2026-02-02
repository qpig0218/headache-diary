import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Seed demo users
export async function POST(request: NextRequest) {
    try {
        // Check if users already exist
        const existingUser = await prisma.user.findFirst()
        if (existingUser) {
            return NextResponse.json({ message: '已有用戶存在' })
        }

        // Create demo users
        const adminPassword = await bcrypt.hash('admin123', 12)
        const userPassword = await bcrypt.hash('password123', 12)

        const admin = await prisma.user.create({
            data: {
                email: 'admin@example.com',
                password: adminPassword,
                name: '系統管理員',
                role: 'admin',
            },
        })

        const user = await prisma.user.create({
            data: {
                email: 'user@example.com',
                password: userPassword,
                name: '測試用戶',
                role: 'user',
            },
        })

        // Create default trigger settings for demo user
        const defaultTriggers = [
            { category: 'food', name: '咖啡因' },
            { category: 'food', name: '酒精' },
            { category: 'food', name: '巧克力' },
            { category: 'lifestyle', name: '睡眠不足' },
            { category: 'lifestyle', name: '壓力' },
            { category: 'environment', name: '強光' },
            { category: 'environment', name: '氣壓變化' },
        ]

        await prisma.triggerSetting.createMany({
            data: defaultTriggers.map(trigger => ({
                userId: user.id,
                ...trigger,
                active: true,
            })),
        })

        // Create some demo headache logs
        const today = new Date()
        const demoLogs = [
            {
                userId: user.id,
                date: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
                intensity: 6,
                location: '太陽穴（左）',
                duration: 120,
                notes: '下午開始感到疼痛，可能與睡眠不足有關。',
                weatherData: JSON.stringify({ temp: 22, humidity: 65, pressure: 1013 }),
                airQualityData: JSON.stringify({ aqi: 45, level: '良好' }),
            },
            {
                userId: user.id,
                date: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
                intensity: 4,
                location: '前額',
                duration: 60,
                notes: '輕微頭痛，午休後緩解。',
                weatherData: JSON.stringify({ temp: 25, humidity: 70, pressure: 1008 }),
                airQualityData: JSON.stringify({ aqi: 52, level: '普通' }),
            },
            {
                userId: user.id,
                date: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
                intensity: 8,
                location: '全頭',
                duration: 240,
                notes: '嚴重頭痛，伴隨噁心感。服用止痛藥後緩解。',
                weatherData: JSON.stringify({ temp: 18, humidity: 80, pressure: 1000 }),
                airQualityData: JSON.stringify({ aqi: 78, level: '普通' }),
            },
        ]

        for (const log of demoLogs) {
            const createdLog = await prisma.headacheLog.create({
                data: log,
            })

            // Add triggers
            await prisma.headacheTrigger.createMany({
                data: [
                    { logId: createdLog.id, triggerType: 'lifestyle', value: '睡眠不足' },
                    { logId: createdLog.id, triggerType: 'environment', value: '氣壓變化' },
                ],
            })
        }

        return NextResponse.json({
            message: '示範資料已建立',
            admin: { email: admin.email },
            user: { email: user.email },
        })
    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json(
            { error: '建立示範資料時發生錯誤' },
            { status: 500 }
        )
    }
}
