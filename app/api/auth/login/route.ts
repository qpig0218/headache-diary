import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()

        if (!email || !password) {
            return NextResponse.json(
                { error: '請輸入電子郵件與密碼' },
                { status: 400 }
            )
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { error: '電子郵件或密碼錯誤' },
                { status: 401 }
            )
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password)

        if (!isValid) {
            return NextResponse.json(
                { error: '電子郵件或密碼錯誤' },
                { status: 401 }
            )
        }

        // Create session token
        const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('session', sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
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
        console.error('Login error:', error)
        return NextResponse.json(
            { error: '登入時發生錯誤' },
            { status: 500 }
        )
    }
}
