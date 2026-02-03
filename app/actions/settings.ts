'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'

export async function saveProfileAction(prevState: any, formData: FormData) {
    const user = await getSession()
    if (!user) {
        return { error: '未登入' }
    }

    const name = formData.get('name') as string

    await prisma.user.update({
        where: { id: user.id },
        data: { name: name || null },
    })

    return { success: true }
}
