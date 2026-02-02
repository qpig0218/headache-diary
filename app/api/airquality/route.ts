import { NextRequest, NextResponse } from 'next/server'

// AQICN (Air Quality) API wrapper
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const lat = searchParams.get('lat')
        const lon = searchParams.get('lon')
        const city = searchParams.get('city')

        const apiKey = process.env.AQICN_API_KEY

        // If no API key, return mock data for development
        if (!apiKey || apiKey === 'your-aqicn-api-key') {
            return NextResponse.json({
                airQuality: {
                    aqi: 45,
                    level: '良好',
                    levelColor: '#4ADE80',
                    pm25: 12,
                    pm10: 25,
                    o3: 35,
                    no2: 15,
                    so2: 5,
                    co: 0.4,
                },
                source: 'mock',
            })
        }

        let url: string
        if (lat && lon) {
            url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiKey}`
        } else if (city) {
            url = `https://api.waqi.info/feed/${encodeURIComponent(city)}/?token=${apiKey}`
        } else {
            // Default to Taipei
            url = `https://api.waqi.info/feed/taipei/?token=${apiKey}`
        }

        const response = await fetch(url, { next: { revalidate: 600 } }) // Cache for 10 minutes
        const data = await response.json()

        if (data.status !== 'ok') {
            throw new Error(data.message || 'Failed to fetch air quality')
        }

        const aqi = data.data.aqi
        let level: string
        let levelColor: string

        if (aqi <= 50) {
            level = '良好'
            levelColor = '#4ADE80'
        } else if (aqi <= 100) {
            level = '普通'
            levelColor = '#FBBF24'
        } else if (aqi <= 150) {
            level = '對敏感族群不健康'
            levelColor = '#F97316'
        } else if (aqi <= 200) {
            level = '不健康'
            levelColor = '#EF4444'
        } else if (aqi <= 300) {
            level = '非常不健康'
            levelColor = '#A855F7'
        } else {
            level = '危險'
            levelColor = '#7F1D1D'
        }

        return NextResponse.json({
            airQuality: {
                aqi,
                level,
                levelColor,
                pm25: data.data.iaqi?.pm25?.v || null,
                pm10: data.data.iaqi?.pm10?.v || null,
                o3: data.data.iaqi?.o3?.v || null,
                no2: data.data.iaqi?.no2?.v || null,
                so2: data.data.iaqi?.so2?.v || null,
                co: data.data.iaqi?.co?.v || null,
            },
            location: {
                name: data.data.city?.name || city,
            },
            source: 'aqicn',
        })
    } catch (error) {
        console.error('Air quality API error:', error)
        // Return mock data on error
        return NextResponse.json({
            airQuality: {
                aqi: 45,
                level: '良好',
                levelColor: '#4ADE80',
                pm25: 12,
                pm10: 25,
                o3: 35,
                no2: 15,
                so2: 5,
                co: 0.4,
            },
            source: 'mock',
            error: 'Unable to fetch live air quality data',
        })
    }
}
