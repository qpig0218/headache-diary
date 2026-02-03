'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface DiarySearchProps {
    totalPages: number
    currentPage: number
}

export default function DiarySearch({ totalPages, currentPage }: DiarySearchProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [query, setQuery] = useState(searchParams.get('q') || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (query) params.set('q', query)
        params.set('page', '1')
        router.push(`/diary?${params.toString()}`)
    }

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))
        router.push(`/diary?${params.toString()}`)
    }

    return (
        <>
            {/* Search & Filter */}
            <form onSubmit={handleSearch} className="search-bar">
                <div className="search-input-wrapper">
                    <Search size={18} />
                    <input
                        type="text"
                        className="form-input"
                        placeholder="搜尋記錄..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-secondary">
                    <Filter size={18} />
                    篩選
                </button>
            </form>

            {/* Pagination (rendered at bottom via portal or separate call) */}
            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={18} />
                        上一頁
                    </button>
                    <span className="page-info">
                        第 {currentPage} 頁，共 {totalPages} 頁
                    </span>
                    <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                    >
                        下一頁
                        <ChevronRight size={18} />
                    </button>
                </div>
            )}

            <style jsx>{`
        .search-bar {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-6);
        }

        .search-input-wrapper {
          flex: 1;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-input-wrapper :global(svg) {
          position: absolute;
          left: var(--space-4);
          color: var(--color-text-muted);
        }

        .search-input-wrapper .form-input {
          padding-left: calc(var(--space-4) + 18px + var(--space-3));
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-4);
          margin-top: var(--space-8);
        }

        .page-info {
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        @media (max-width: 768px) {
          .search-bar {
            flex-direction: column;
          }
        }
      `}</style>
        </>
    )
}
