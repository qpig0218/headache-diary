import { fetchWeatherData, fetchAirQualityData } from '@/lib/env-data'
import DiaryForm from '@/app/components/DiaryForm'

export default async function NewDiaryPage() {
    // Fetch environment data on server
    const [weather, airQuality] = await Promise.all([
        fetchWeatherData(),
        fetchAirQualityData(),
    ])

    return <DiaryForm weather={weather} airQuality={airQuality} />
}
