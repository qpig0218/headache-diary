'use server'

import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: '請輸入電子郵件與密碼' }
    }

    const user = await prisma.user.findUnique({
        where: { email },
    })

    if (!user) {
        return { error: '電子郵件或密碼錯誤' }
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
        return { error: '電子郵件或密碼錯誤' }
    }

    const sessionToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')

    const cookieStore = cookies()
    cookieStore.set('session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    })

    if (user.role === 'admin') {
        redirect('/admin')
    } else {
        redirect('/dashboard')
    }
}

export async function registerAction(prevState: any, formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!email || !password) {
        return { error: '請輸入電子郵件與密碼' }
    }

    if (password.length < 6) {
        return { error: '密碼至少需要 6 個字元' }
    }

    if (password !== confirmPassword) {
        return { error: '密碼與確認密碼不相符' }
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return { error: '此電子郵件已被註冊' }
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
        data: {
            name: name || null,
            email,
            password: hashedPassword,
            role: 'user',
        },
    })

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

    redirect('/login?registered=true')
}

export async function logoutAction() {
    const cookieStore = cookies()
    cookieStore.delete('session')
    redirect('/login')
}
