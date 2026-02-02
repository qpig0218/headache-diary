import { cookies } from 'next/headers'
import { prisma } from './prisma'

export interface SessionUser {
    id: string
    email: string
    name: string | null
    role: string
}

// Simple session management using cookies
export async function createSession(userId: string): Promise<string> {
    // Generate a simple session token
    const sessionToken = Buffer.from(`${userId}:${Date.now()}`).toString('base64')

    // In production, you would store this in a sessions table
    // For now, we'll just use the token directly
    return sessionToken
}

export async function getSession(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies()
        const sessionCookie = cookieStore.get('session')

        if (!sessionCookie) {
            return null
        }

        // Decode the session token
        const decoded = Buffer.from(sessionCookie.value, 'base64').toString('utf-8')
        const [userId] = decoded.split(':')

        if (!userId) {
            return null
        }

        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        })

        return user
    } catch {
        return null
    }
}

export async function requireAuth(): Promise<SessionUser> {
    const session = await getSession()

    if (!session) {
        throw new Error('Unauthorized')
    }

    return session
}

export async function requireAdmin(): Promise<SessionUser> {
    const session = await requireAuth()

    if (session.role !== 'admin') {
        throw new Error('Forbidden')
    }

    return session
}
