'use client'

import { useState } from 'react'
import {
    Plus,
    Cpu,
    Watch,
    Wind,
    Settings,
    Copy,
    CheckCircle,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
} from 'lucide-react'

interface Device {
    id: string
    name: string
    type: string
    apiKey: string
    active: boolean
    lastSeen: string | null
    createdAt: string
    _count: { readings: number }
}

interface DeviceManagerProps {
    initialDevices: Device[]
}

const TYPE_CONFIG: Record<string, { label: string; icon: any }> = {
    env_sensor: { label: '環境感測器', icon: Settings },
    wearable: { label: '穿戴裝置', icon: Watch },
    air_quality: { label: '空氣品質', icon: Wind },
    custom: { label: '自定義', icon: Cpu },
}

export default function DeviceManager({ initialDevices }: DeviceManagerProps) {
    const [devices, setDevices] = useState(initialDevices)
    const [showForm, setShowForm] = useState(false)
    const [name, setName] = useState('')
    const [type, setType] = useState('env_sensor')
    const [loading, setLoading] = useState(false)
    const [newApiKey, setNewApiKey] = useState<string | null>(null)
    const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
    const [copied, setCopied] = useState(false)

    const addDevice = async () => {
        if (!name.trim()) return
        setLoading(true)
        try {
            const res = await fetch('/api/iot/devices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, type }),
            })
            const data = await res.json()
            if (data.device) {
                setDevices([{ ...data.device, _count: { readings: 0 } }, ...devices])
                setNewApiKey(data.device.apiKey)
                setName('')
                setShowForm(false)
            }
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const toggleDevice = async (id: string, active: boolean) => {
        const res = await fetch(`/api/iot/devices/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ active }),
        })
        if (res.ok) {
            setDevices(devices.map(d => d.id === id ? { ...d, active } : d))
        }
    }

    const deleteDevice = async (id: string) => {
        if (!confirm('確定要刪除此裝置？所有讀數也會一併刪除。')) return
        const res = await fetch(`/api/iot/devices/${id}`, { method: 'DELETE' })
        if (res.ok) {
            setDevices(devices.filter(d => d.id !== id))
        }
    }

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const toggleKeyVisibility = (id: string) => {
        setVisibleKeys(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="device-manager">
            {/* New API Key Alert */}
            {newApiKey && (
                <div className="new-key-alert">
                    <CheckCircle size={20} />
                    <div className="new-key-content">
                        <strong>裝置已建立！請妥善保存 API Key：</strong>
                        <div className="new-key-value">
                            <code>{newApiKey}</code>
                            <button className="btn btn-ghost btn-icon" onClick={() => copyKey(newApiKey)}>
                                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <p>此 API Key 只會顯示一次，請立即複製保存。</p>
                    </div>
                    <button className="btn btn-ghost btn-sm" onClick={() => setNewApiKey(null)}>關閉</button>
                </div>
            )}

            {/* Add Device Form */}
            {showForm ? (
                <div className="add-device-form">
                    <h4>新增 IoT 裝置</h4>
                    <div className="form-group">
                        <label className="form-label">裝置名稱</label>
                        <input
                            type="text"
                            className="form-input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="例如：客廳溫濕度計"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">裝置類型</label>
                        <div className="device-type-grid">
                            {Object.entries(TYPE_CONFIG).map(([key, config]) => {
                                const Icon = config.icon
                                return (
                                    <button
                                        key={key}
                                        className={`device-type-btn ${type === key ? 'active' : ''}`}
                                        onClick={() => setType(key)}
                                        type="button"
                                    >
                                        <Icon size={20} />
                                        <span>{config.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="form-actions">
                        <button className="btn btn-ghost" onClick={() => setShowForm(false)}>取消</button>
                        <button className="btn btn-primary" onClick={addDevice} disabled={loading || !name.trim()}>
                            {loading ? <Loader2 size={18} className="spinner" /> : <Plus size={18} />}
                            建立裝置
                        </button>
                    </div>
                </div>
            ) : (
                <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                    <Plus size={18} />
                    新增裝置
                </button>
            )}

            {/* Device List */}
            <div className="device-list">
                {devices.length > 0 ? (
                    devices.map(device => {
                        const config = TYPE_CONFIG[device.type] || TYPE_CONFIG.custom
                        const Icon = config.icon
                        const keyVisible = visibleKeys.has(device.id)
                        return (
                            <div key={device.id} className={`device-card ${!device.active ? 'inactive' : ''}`}>
                                <div className="device-header">
                                    <div className="device-icon">
                                        <Icon size={24} />
                                    </div>
                                    <div className="device-title">
                                        <span className="device-name">{device.name}</span>
                                        <span className="device-type">{config.label}</span>
                                    </div>
                                    <div className="device-status">
                                        <span className={`status-dot ${device.active ? 'active' : ''}`} />
                                        <span>{device.active ? '啟用' : '停用'}</span>
                                    </div>
                                </div>
                                <div className="device-details">
                                    <div className="device-key">
                                        <span className="key-label">API Key：</span>
                                        <code>{keyVisible ? device.apiKey : '••••••••••••••••'}</code>
                                        <button className="btn btn-ghost btn-icon" onClick={() => toggleKeyVisibility(device.id)}>
                                            {keyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                        <button className="btn btn-ghost btn-icon" onClick={() => copyKey(device.apiKey)}>
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                    <div className="device-meta">
                                        <span>讀數：{device._count.readings}</span>
                                        <span>
                                            最後活動：{device.lastSeen
                                                ? new Date(device.lastSeen).toLocaleString('zh-TW')
                                                : '從未'}
                                        </span>
                                    </div>
                                </div>
                                <div className="device-actions">
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => toggleDevice(device.id, !device.active)}
                                    >
                                        {device.active ? '停用' : '啟用'}
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => deleteDevice(device.id)}
                                        style={{ color: '#EF4444' }}
                                    >
                                        <Trash2 size={14} />
                                        刪除
                                    </button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="empty-state">
                        <Cpu size={48} />
                        <h3>尚無裝置</h3>
                        <p>新增您的第一個 IoT 裝置開始接收數據</p>
                    </div>
                )}
            </div>
        </div>
    )
}
