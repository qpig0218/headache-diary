import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: '智能頭痛日記 | Headache Diary',
    description: '智能化頭痛紀錄與追蹤系統，整合天氣、空氣品質等因素分析',
    keywords: ['頭痛', '日記', '健康追蹤', '天氣', '空氣品質'],
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="zh-TW">
            <body>
                {/* Modern Art Background */}
                <div className="art-background">
                    <div className="art-shape art-shape-1"></div>
                    <div className="art-shape art-shape-2"></div>
                    <div className="art-shape art-shape-3"></div>
                    <div className="art-grid"></div>
                </div>
                {children}
            </body>
        </html>
    )
}
