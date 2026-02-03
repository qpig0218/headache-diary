'use client'

import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import Link from 'next/link'
import {
    ArrowLeft,
    Save,
    Cloud,
    Wind,
    MapPin,
    Clock,
    Calendar,
    FileText,
    Loader2,
    CheckCircle,
} from 'lucide-react'
import { createHeadacheAction } from '@/app/actions/headache'

const HEADACHE_LOCATIONS = [
    '前額', '太陽穴（左）', '太陽穴（右）', '頭頂', '後腦',
    '左側', '右側', '全頭', '眼睛周圍', '頸部',
]

const TRIGGER_CATEGORIES: Record<string, { label: string; items: string[] }> = {
    food: { label: '飲食', items: ['咖啡因', '酒精', '巧克力', '起司', '加工食品', '味精', '甜食'] },
    lifestyle: { label: '生活習慣', items: ['睡眠不足', '睡太多', '壓力', '過度運動', '缺乏運動', '脫水', '跳過正餐'] },
    environment: { label: '環境', items: ['強光', '噪音', '氣味', '氣溫變化', '濕度', '氣壓變化', '高海拔'] },
    hormone: { label: '荷爾蒙', items: ['月經週期', '排卵期', '更年期'] },
    other: { label: '其他', items: ['姿勢不良', '眼睛疲勞', '藥物', '過敏'] },
}

interface DiaryFormProps {
    weather: { temp: number; humidity: number; pressure: number; description: string } | null
    airQuality: { aqi: number; level: string; pm25: number | null } | null
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={pending}
        >
            {pending ? (
                <>
                    <Loader2 size={20} className="spinner" />
                    儲存中...
                </>
            ) : (
                <>
                    <Save size={20} />
                    儲存記錄
                </>
            )}
        </button>
    )
}

export default function DiaryForm({ weather, airQuality }: DiaryFormProps) {
    const [state, formAction] = useFormState(createHeadacheAction, null)
    const [intensity, setIntensity] = useState(5)
    const [location, setLocation] = useState('')
    const [selectedTriggers, setSelectedTriggers] = useState<string[]>([])

    const toggleTrigger = (trigger: string) => {
        setSelectedTriggers(prev =>
            prev.includes(trigger) ? prev.filter(t => t !== trigger) : [...prev, trigger]
        )
    }

    const getIntensityColor = (level: number) => {
        if (level <= 3) return '#22C55E'
        if (level <= 6) return '#F59E0B'
        if (level <= 8) return '#F97316'
        return '#EF4444'
    }

    const now = new Date()
    const defaultDate = now.toISOString().slice(0, 16)

    return (
        <div className="new-diary-page">
            <div className="page-header">
                <Link href="/diary" className="btn btn-ghost btn-sm back-btn">
                    <ArrowLeft size={18} />
                    返回日記
                </Link>
                <h1 className="page-title">記錄頭痛</h1>
            </div>

            {state?.error && (
                <div className="auth-error" style={{ marginBottom: 'var(--space-4)' }}>
                    <span>{state.error}</span>
                </div>
            )}

            <form action={formAction} className="diary-form">
                {/* Hidden fields for server action */}
                <input type="hidden" name="intensity" value={intensity} />
                <input type="hidden" name="location" value={location} />
                <input type="hidden" name="triggers" value={JSON.stringify(
                    selectedTriggers.map(value => ({
                        type: Object.entries(TRIGGER_CATEGORIES).find(([_, cat]) =>
                            cat.items.includes(value)
                        )?.[0] || 'other',
                        value,
                    }))
                )} />

                <div className="form-layout">
                    {/* Main Form */}
                    <div className="form-main">
                        {/* Date & Time */}
                        <div className="form-section">
                            <div className="section-header">
                                <Calendar size={20} />
                                <h3>日期與時間</h3>
                            </div>
                            <input
                                type="datetime-local"
                                name="date"
                                className="form-input"
                                defaultValue={defaultDate}
                                required
                            />
                        </div>

                        {/* Intensity */}
                        <div className="form-section">
                            <div className="section-header">
                                <h3>疼痛強度</h3>
                                <span className="intensity-value" style={{ color: getIntensityColor(intensity) }}>
                                    {intensity}/10
                                </span>
                            </div>
                            <div className="intensity-slider">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                    <button
                                        key={level}
                                        type="button"
                                        className={`intensity-dot level-${level} ${intensity === level ? 'active' : ''}`}
                                        onClick={() => setIntensity(level)}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                            <div className="intensity-labels">
                                <span>輕微</span>
                                <span>中度</span>
                                <span>嚴重</span>
                                <span>劇烈</span>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="form-section">
                            <div className="section-header">
                                <MapPin size={20} />
                                <h3>疼痛位置</h3>
                            </div>
                            <div className="location-grid">
                                {HEADACHE_LOCATIONS.map(loc => (
                                    <button
                                        key={loc}
                                        type="button"
                                        className={`location-btn ${location === loc ? 'active' : ''}`}
                                        onClick={() => setLocation(location === loc ? '' : loc)}
                                    >
                                        {loc}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Duration */}
                        <div className="form-section">
                            <div className="section-header">
                                <Clock size={20} />
                                <h3>持續時間（分鐘）</h3>
                            </div>
                            <input
                                type="number"
                                name="duration"
                                className="form-input"
                                placeholder="例如：30"
                                min="1"
                            />
                        </div>

                        {/* Triggers */}
                        <div className="form-section">
                            <div className="section-header">
                                <h3>可能的觸發因素</h3>
                            </div>
                            {Object.entries(TRIGGER_CATEGORIES).map(([key, category]) => (
                                <div key={key} className="trigger-category">
                                    <h4>{category.label}</h4>
                                    <div className="trigger-buttons">
                                        {category.items.map(item => (
                                            <button
                                                key={item}
                                                type="button"
                                                className={`trigger-btn ${selectedTriggers.includes(item) ? 'active' : ''}`}
                                                onClick={() => toggleTrigger(item)}
                                            >
                                                {item}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Notes */}
                        <div className="form-section">
                            <div className="section-header">
                                <FileText size={20} />
                                <h3>備註</h3>
                            </div>
                            <textarea
                                name="notes"
                                className="form-input"
                                placeholder="記錄其他相關資訊..."
                                rows={4}
                            />
                        </div>
                    </div>

                    {/* Sidebar - Environment Info */}
                    <div className="form-sidebar">
                        <div className="env-card">
                            <div className="env-header">
                                <Cloud size={20} />
                                <h4>目前天氣</h4>
                            </div>
                            {weather ? (
                                <div className="env-content">
                                    <div className="env-main">
                                        <span className="env-value">{weather.temp}°C</span>
                                        <span className="env-desc">{weather.description}</span>
                                    </div>
                                    <div className="env-details">
                                        <div className="env-detail">
                                            <span>濕度</span>
                                            <span>{weather.humidity}%</span>
                                        </div>
                                        <div className="env-detail">
                                            <span>氣壓</span>
                                            <span>{weather.pressure} hPa</span>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="env-error">無法取得天氣資料</p>
                            )}
                        </div>

                        <div className="env-card">
                            <div className="env-header">
                                <Wind size={20} />
                                <h4>空氣品質</h4>
                            </div>
                            {airQuality ? (
                                <div className="env-content">
                                    <div className="aqi-display">
                                        <span className="aqi-value">{airQuality.aqi}</span>
                                        <span className="aqi-label">{airQuality.level}</span>
                                    </div>
                                    {airQuality.pm25 !== null && (
                                        <div className="env-detail">
                                            <span>PM2.5</span>
                                            <span>{airQuality.pm25} µg/m³</span>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <p className="env-error">無法取得空氣品質資料</p>
                            )}
                        </div>

                        <p className="env-note">
                            天氣與空氣品質資料將自動記錄，供未來分析使用。
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="form-actions">
                    <SubmitButton />
                </div>
            </form>

            <style jsx>{`
        .new-diary-page {
          max-width: 1200px;
          margin: 0 auto;
        }
        .page-header { margin-bottom: var(--space-6); }
        .back-btn { margin-bottom: var(--space-4); }
        .form-layout {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: var(--space-8);
        }
        .form-main {
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }
        .form-section {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        .section-header {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
          color: var(--color-text-secondary);
        }
        .section-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
          margin: 0;
        }
        .intensity-value {
          margin-left: auto;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .intensity-slider {
          display: flex;
          gap: var(--space-2);
          justify-content: space-between;
        }
        .intensity-labels {
          display: flex;
          justify-content: space-between;
          margin-top: var(--space-3);
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }
        .location-grid {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .location-btn {
          padding: var(--space-2) var(--space-4);
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .location-btn:hover {
          border-color: var(--color-primary);
          color: var(--color-text-primary);
        }
        .location-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--color-primary);
          color: var(--color-primary-light);
        }
        .trigger-category { margin-bottom: var(--space-4); }
        .trigger-category:last-child { margin-bottom: 0; }
        .trigger-category h4 {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: var(--space-3);
        }
        .trigger-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .trigger-btn {
          padding: var(--space-2) var(--space-3);
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .trigger-btn:hover { border-color: var(--color-primary); }
        .trigger-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--color-primary);
          color: var(--color-primary-light);
        }
        .form-sidebar {
          position: sticky;
          top: calc(72px + var(--space-8));
          height: fit-content;
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .env-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
        }
        .env-header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          margin-bottom: var(--space-4);
          color: var(--color-text-secondary);
        }
        .env-header h4 { font-size: 0.875rem; font-weight: 600; margin: 0; }
        .env-content { display: flex; flex-direction: column; gap: var(--space-4); }
        .env-main { display: flex; flex-direction: column; }
        .env-value { font-size: 2rem; font-weight: 700; font-family: var(--font-display); }
        .env-desc { font-size: 0.875rem; color: var(--color-text-secondary); }
        .env-details { display: flex; gap: var(--space-4); }
        .env-detail { display: flex; flex-direction: column; font-size: 0.875rem; }
        .env-detail span:first-child { color: var(--color-text-muted); font-size: 0.75rem; }
        .aqi-display { display: flex; flex-direction: column; }
        .aqi-value { font-size: 2rem; font-weight: 700; font-family: var(--font-display); color: #4ADE80; }
        .aqi-label { font-size: 0.875rem; color: var(--color-text-secondary); }
        .env-error { font-size: 0.875rem; color: var(--color-text-muted); }
        .env-note {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          padding: var(--space-3);
          background: var(--color-bg-glass);
          border-radius: var(--radius-md);
        }
        .form-actions {
          margin-top: var(--space-8);
          display: flex;
          justify-content: center;
        }
        .spinner { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 1024px) {
          .form-layout { grid-template-columns: 1fr; }
          .form-sidebar { position: static; order: -1; }
        }
        @media (max-width: 768px) {
          .intensity-slider { flex-wrap: wrap; }
          .intensity-labels { display: none; }
        }
      `}</style>
        </div>
    )
}
