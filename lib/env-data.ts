// Server-side weather and air quality data fetching

export interface WeatherData {
    temp: number
    humidity: number
    pressure: number
    description: string
    icon: string
    windSpeed: number
    clouds?: number
}

export interface AirQualityData {
    aqi: number
    level: string
    levelColor: string
    pm25: number | null
}

export async function fetchWeatherData(): Promise<WeatherData | null> {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY

        if (!apiKey || apiKey === 'your-openweather-api-key') {
            return {
                temp: 22,
                humidity: 65,
                pressure: 1013,
                description: '晴朗',
                icon: '01d',
                windSpeed: 3.5,
                clouds: 10,
            }
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=Taipei&appid=${apiKey}&units=metric&lang=zh_tw`
        const response = await fetch(url, { next: { revalidate: 600 } })
        const data = await response.json()

        if (!response.ok) return null

        return {
            temp: Math.round(data.main.temp),
            humidity: data.main.humidity,
            pressure: data.main.pressure,
            description: data.weather[0].description,
            icon: data.weather[0].icon,
            windSpeed: data.wind.speed,
            clouds: data.clouds.all,
        }
    } catch {
        return {
            temp: 22,
            humidity: 65,
            pressure: 1013,
            description: '晴朗',
            icon: '01d',
            windSpeed: 3.5,
            clouds: 10,
        }
    }
}

export async function fetchAirQualityData(): Promise<AirQualityData | null> {
    try {
        const apiKey = process.env.AQICN_API_KEY

        if (!apiKey || apiKey === 'your-aqicn-api-key') {
            return {
                aqi: 45,
                level: '良好',
                levelColor: '#4ADE80',
                pm25: 12,
            }
        }

        const url = `https://api.waqi.info/feed/taipei/?token=${apiKey}`
        const response = await fetch(url, { next: { revalidate: 600 } })
        const data = await response.json()

        if (data.status !== 'ok') return null

        const aqi = data.data.aqi
        let level: string
        let levelColor: string

        if (aqi <= 50) { level = '良好'; levelColor = '#4ADE80' }
        else if (aqi <= 100) { level = '普通'; levelColor = '#FBBF24' }
        else if (aqi <= 150) { level = '對敏感族群不健康'; levelColor = '#F97316' }
        else if (aqi <= 200) { level = '不健康'; levelColor = '#EF4444' }
        else if (aqi <= 300) { level = '非常不健康'; levelColor = '#A855F7' }
        else { level = '危險'; levelColor = '#7F1D1D' }

        return {
            aqi,
            level,
            levelColor,
            pm25: data.data.iaqi?.pm25?.v || null,
        }
    } catch {
        return {
            aqi: 45,
            level: '良好',
            levelColor: '#4ADE80',
            pm25: 12,
        }
    }
}
