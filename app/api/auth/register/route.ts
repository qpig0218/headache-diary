import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
    try {
        const { name, email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: '請輸入電子郵件與密碼' },
                { status: 400 }
            )
        }

        if (password.length < 6) {
            return NextResponse.json(
                { error: '密碼至少需要 6 個字元' },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { error: '此電子郵件已被註冊' },
                { status: 400 }
            )
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12)

        // Create user
        const user = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
                role: 'user',
            },
        })

        // Create default trigger settings for the new user
        const defaultTriggers = [
            { category: 'food', name: '咖啡因' },
            { category: 'food', name: '酒精' },
            { category: 'food', name: '巧克力' },
            { category: 'food', name: '起司' },
            { category: 'lifestyle', name: '睡眠不足' },
            { category: 'lifestyle', name: '壓力' },
            { category: 'lifestyle', name: '運動' },
            { category: 'environment', name: '強光' },
            { category: 'environment', name: '噪音' },
            { category: 'environment', name: '氣味' },
            { category: 'hormone', name: '月經週期' },
        ]

        await prisma.triggerSetting.createMany({
            data: defaultTriggers.map(trigger => ({
                userId: user.id,
                ...trigger,
                active: true,
            })),
        })

        return NextResponse.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        })
    } catch (error) {
        console.error('Registration error:', error)
        return NextResponse.json(
            { error: '註冊時發生錯誤' },
            { status: 500 }
        )
    }
}
