'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { importHealthFile } from '@/app/actions/health'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? (
                <><Loader2 size={18} className="spinner" /><span>匯入中...</span></>
            ) : (
                <><Upload size={18} /><span>開始匯入</span></>
            )}
        </button>
    )
}

export default function HealthImportForm() {
    const [state, formAction] = useFormState(importHealthFile, null)
    const [fileName, setFileName] = useState('')

    return (
        <div className="import-section">
            <h3>匯入健康數據</h3>
            <p className="section-desc">上傳從 Apple Health 匯出的 CSV 或 JSON 檔案</p>

            {state?.error && (
                <div className="auth-error">
                    <AlertCircle size={18} />
                    <span>{state.error}</span>
                </div>
            )}

            {state?.success && (
                <div className="import-success">
                    <CheckCircle size={18} />
                    <span>成功匯入 {state.recordCount} 筆資料</span>
                    {state.errorCount > 0 && (
                        <span className="import-warn">（{state.errorCount} 筆無法解析）</span>
                    )}
                </div>
            )}

            <form action={formAction} className="import-form">
                <label className="file-drop-zone">
                    <input
                        type="file"
                        name="file"
                        accept=".csv,.json"
                        className="sr-only"
                        onChange={e => setFileName(e.target.files?.[0]?.name || '')}
                    />
                    <div className="drop-content">
                        {fileName ? (
                            <>
                                <FileText size={32} />
                                <span className="file-name">{fileName}</span>
                            </>
                        ) : (
                            <>
                                <Upload size={32} />
                                <span>點擊選擇檔案或拖放至此</span>
                                <span className="file-hint">支援 CSV、JSON 格式</span>
                            </>
                        )}
                    </div>
                </label>
                <SubmitButton />
            </form>

            <div className="import-help">
                <h4>支援的資料格式</h4>
                <p>CSV 欄位：type, value, unit, startDate, endDate</p>
                <p>JSON 格式：陣列或 {`{"data": [...]}`}</p>
                <p>支援的資料類型：heartRate, steps, sleep, bloodPressure, bodyTemp, bloodOxygen</p>
            </div>
        </div>
    )
}
