import { NextRequest, NextResponse } from 'next/server'

// OpenWeatherMap API wrapper
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const lat = searchParams.get('lat')
        const lon = searchParams.get('lon')
        const city = searchParams.get('city')

        const apiKey = process.env.OPENWEATHER_API_KEY

        // If no API key, return mock data for development
        if (!apiKey || apiKey === 'your-openweather-api-key') {
            return NextResponse.json({
                weather: {
                    temp: 22,
                    humidity: 65,
                    pressure: 1013,
                    description: '晴朗',
                    icon: '01d',
                    windSpeed: 3.5,
                    clouds: 10,
                },
                source: 'mock',
            })
        }

        let url: string
        if (lat && lon) {
            url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=zh_tw`
        } else if (city) {
            url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=zh_tw`
        } else {
            // Default to Taipei
            url = `https://api.openweathermap.org/data/2.5/weather?q=Taipei&appid=${apiKey}&units=metric&lang=zh_tw`
        }

        const response = await fetch(url, { next: { revalidate: 600 } }) // Cache for 10 minutes
        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.message || 'Failed to fetch weather')
        }

        return NextResponse.json({
            weather: {
                temp: Math.round(data.main.temp),
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                description: data.weather[0].description,
                icon: data.weather[0].icon,
                windSpeed: data.wind.speed,
                clouds: data.clouds.all,
                feelsLike: Math.round(data.main.feels_like),
                tempMin: Math.round(data.main.temp_min),
                tempMax: Math.round(data.main.temp_max),
            },
            location: {
                city: data.name,
                country: data.sys.country,
            },
            source: 'openweathermap',
        })
    } catch (error) {
        console.error('Weather API error:', error)
        // Return mock data on error
        return NextResponse.json({
            weather: {
                temp: 22,
                humidity: 65,
                pressure: 1013,
                description: '晴朗',
                icon: '01d',
                windSpeed: 3.5,
                clouds: 10,
            },
            source: 'mock',
            error: 'Unable to fetch live weather data',
        })
    }
}
