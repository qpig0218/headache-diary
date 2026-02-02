'use client'

import Link from 'next/link'
import {
    Brain,
    Cloud,
    Wind,
    Calendar,
    BarChart3,
    Shield,
    Smartphone,
    ArrowRight,
    Activity,
    Sun,
    Moon,
    Zap,
    Heart
} from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="landing-page">
            {/* Header */}
            <header className="header">
                <div className="logo">
                    <Brain className="icon-lg icon-gradient" />
                    <span className="logo-text">智能頭痛日記</span>
                </div>
                <nav>
                    <ul className="nav-links">
                        <li><a href="#features" className="nav-link">功能特色</a></li>
                        <li><a href="#how-it-works" className="nav-link">如何運作</a></li>
                    </ul>
                </nav>
                <div className="header-actions">
                    <Link href="/login" className="btn btn-ghost">登入</Link>
                    <Link href="/register" className="btn btn-primary">免費註冊</Link>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <div className="hero-badge">
                        <Zap size={14} />
                        <span>AI 智能分析</span>
                    </div>
                    <h1 className="hero-title">
                        記錄頭痛<br />
                        <span className="gradient-text">洞察規律</span>
                    </h1>
                    <p className="hero-description">
                        智能頭痛日記系統，整合即時天氣、空氣品質與生活習慣追蹤，
                        幫助您發現頭痛觸發因素，掌握健康主動權。
                    </p>
                    <div className="hero-actions">
                        <Link href="/register" className="btn btn-primary btn-lg">
                            開始使用
                            <ArrowRight size={18} />
                        </Link>
                        <Link href="#features" className="btn btn-secondary btn-lg">
                            了解更多
                        </Link>
                    </div>
                    <div className="hero-stats">
                        <div className="hero-stat">
                            <span className="stat-number">10+</span>
                            <span className="stat-text">追蹤因素</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">即時</span>
                            <span className="stat-text">天氣整合</span>
                        </div>
                        <div className="hero-stat">
                            <span className="stat-number">AI</span>
                            <span className="stat-text">智能分析</span>
                        </div>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="hero-card hero-card-1">
                        <div className="mini-card-icon">
                            <Activity className="icon-gradient" />
                        </div>
                        <div className="mini-card-content">
                            <span className="mini-card-label">今日頭痛指數</span>
                            <span className="mini-card-value">2/10</span>
                        </div>
                    </div>
                    <div className="hero-card hero-card-2">
                        <div className="mini-card-icon">
                            <Sun className="icon-gradient" />
                        </div>
                        <div className="mini-card-content">
                            <span className="mini-card-label">天氣狀況</span>
                            <span className="mini-card-value">晴朗 25°C</span>
                        </div>
                    </div>
                    <div className="hero-card hero-card-3">
                        <div className="mini-card-icon">
                            <Wind className="icon-gradient" />
                        </div>
                        <div className="mini-card-content">
                            <span className="mini-card-label">空氣品質</span>
                            <span className="mini-card-value badge-success">良好 AQI 45</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section - Bento Grid */}
            <section id="features" className="features-section">
                <div className="section-header">
                    <h2>核心功能</h2>
                    <p>全方位的頭痛追蹤與分析系統</p>
                </div>

                <div className="bento-grid features-grid">
                    {/* Large Feature Card */}
                    <div className="bento-item bento-span-2 bento-row-2 feature-card feature-main">
                        <div className="feature-icon-large">
                            <Brain size={48} />
                        </div>
                        <h3>智能記錄系統</h3>
                        <p>
                            快速記錄頭痛發作時間、強度、位置與持續時間。
                            系統自動關聯當時的天氣、空氣品質等環境因素。
                        </p>
                        <div className="feature-preview">
                            <div className="intensity-preview">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                                    <div
                                        key={level}
                                        className={`intensity-dot level-${level} ${level <= 3 ? 'active' : ''}`}
                                    >
                                        {level}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Weather Integration */}
                    <div className="bento-item feature-card">
                        <div className="feature-icon">
                            <Cloud size={28} />
                        </div>
                        <h4>天氣追蹤</h4>
                        <p>自動記錄溫度、濕度、氣壓變化，分析天氣對頭痛的影響。</p>
                    </div>

                    {/* Air Quality */}
                    <div className="bento-item feature-card">
                        <div className="feature-icon">
                            <Wind size={28} />
                        </div>
                        <h4>空氣品質監測</h4>
                        <p>整合 AQI 指數，追蹤 PM2.5 等污染物對頭痛的潛在影響。</p>
                    </div>

                    {/* Analytics */}
                    <div className="bento-item bento-span-2 feature-card">
                        <div className="feature-icon">
                            <BarChart3 size={28} />
                        </div>
                        <h4>數據視覺化分析</h4>
                        <p>直覺化圖表呈現頭痛趨勢，發現週期性規律與觸發因素關聯。</p>
                        <div className="chart-preview">
                            <div className="chart-bar" style={{ height: '40%' }}></div>
                            <div className="chart-bar" style={{ height: '60%' }}></div>
                            <div className="chart-bar" style={{ height: '30%' }}></div>
                            <div className="chart-bar" style={{ height: '80%' }}></div>
                            <div className="chart-bar" style={{ height: '50%' }}></div>
                            <div className="chart-bar" style={{ height: '70%' }}></div>
                            <div className="chart-bar" style={{ height: '45%' }}></div>
                        </div>
                    </div>

                    {/* Calendar View */}
                    <div className="bento-item feature-card">
                        <div className="feature-icon">
                            <Calendar size={28} />
                        </div>
                        <h4>日曆視圖</h4>
                        <p>月曆模式一覽頭痛發作頻率與模式。</p>
                    </div>

                    {/* Mobile Responsive */}
                    <div className="bento-item feature-card">
                        <div className="feature-icon">
                            <Smartphone size={28} />
                        </div>
                        <h4>跨裝置同步</h4>
                        <p>響應式設計，手機、平板、電腦隨時記錄。</p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="how-it-works-section">
                <div className="section-header">
                    <h2>如何運作</h2>
                    <p>簡單三步驟，開始追蹤您的頭痛模式</p>
                </div>

                <div className="steps-container">
                    <div className="step-card">
                        <div className="step-number">01</div>
                        <div className="step-icon">
                            <Heart size={32} />
                        </div>
                        <h4>記錄頭痛</h4>
                        <p>發作時快速記錄強度、位置與症狀，系統自動記錄時間與環境數據。</p>
                    </div>

                    <div className="step-connector">
                        <ArrowRight size={24} />
                    </div>

                    <div className="step-card">
                        <div className="step-number">02</div>
                        <div className="step-icon">
                            <Activity size={32} />
                        </div>
                        <h4>累積數據</h4>
                        <p>持續記錄建立個人健康資料庫，系統分析各種因素的關聯性。</p>
                    </div>

                    <div className="step-connector">
                        <ArrowRight size={24} />
                    </div>

                    <div className="step-card">
                        <div className="step-number">03</div>
                        <div className="step-icon">
                            <BarChart3 size={32} />
                        </div>
                        <h4>洞察規律</h4>
                        <p>視覺化報表呈現頭痛模式，發現觸發因素並預防未來發作。</p>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2>準備好開始了嗎？</h2>
                    <p>免費註冊，開始智能追蹤您的頭痛模式</p>
                    <Link href="/register" className="btn btn-primary btn-lg">
                        立即開始
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <Brain className="icon-lg icon-gradient" />
                        <span>智能頭痛日記</span>
                    </div>
                    <p className="footer-copy">
                        © 2026 智能頭痛日記. All rights reserved.
                    </p>
                </div>
            </footer>

            <style jsx>{`
        .landing-page {
          min-height: 100vh;
        }

        /* Logo */
        .logo {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .logo-text {
          font-family: var(--font-display);
          font-size: 1.25rem;
          font-weight: 700;
          background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-actions {
          display: flex;
          gap: var(--space-3);
        }

        /* Hero Section */
        .hero {
          min-height: calc(100vh - 72px);
          padding: calc(72px + var(--space-16)) var(--space-8) var(--space-16);
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          align-items: center;
          max-width: 1400px;
          margin: 0 auto;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: var(--space-2);
          padding: var(--space-2) var(--space-4);
          background: rgba(99, 102, 241, 0.15);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: var(--radius-full);
          color: var(--color-primary-light);
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: var(--space-6);
        }

        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: var(--space-6);
        }

        .gradient-text {
          background: linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          line-height: 1.7;
          color: var(--color-text-secondary);
          margin-bottom: var(--space-8);
          max-width: 540px;
        }

        .hero-actions {
          display: flex;
          gap: var(--space-4);
          margin-bottom: var(--space-10);
        }

        .hero-stats {
          display: flex;
          gap: var(--space-8);
        }

        .hero-stat {
          display: flex;
          flex-direction: column;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          font-family: var(--font-display);
          color: var(--color-text-primary);
        }

        .stat-text {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          height: 400px;
        }

        .hero-card {
          position: absolute;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          backdrop-filter: blur(20px);
          display: flex;
          gap: var(--space-4);
          align-items: center;
          animation: floatCard 6s ease-in-out infinite;
        }

        .hero-card-1 {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .hero-card-2 {
          top: 40%;
          right: 5%;
          animation-delay: -2s;
        }

        .hero-card-3 {
          bottom: 15%;
          left: 20%;
          animation-delay: -4s;
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .mini-card-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(99, 102, 241, 0.15);
          border-radius: var(--radius-lg);
        }

        .mini-card-content {
          display: flex;
          flex-direction: column;
        }

        .mini-card-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .mini-card-value {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        /* Features Section */
        .features-section {
          padding: var(--space-20) var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
        }

        .section-header {
          text-align: center;
          margin-bottom: var(--space-12);
        }

        .section-header h2 {
          margin-bottom: var(--space-4);
        }

        .section-header p {
          font-size: 1.125rem;
        }

        .features-grid {
          grid-auto-rows: minmax(200px, auto);
        }

        .feature-card {
          display: flex;
          flex-direction: column;
        }

        .feature-card h3 {
          margin-top: var(--space-6);
          margin-bottom: var(--space-3);
        }

        .feature-card h4 {
          margin-top: var(--space-4);
          margin-bottom: var(--space-2);
        }

        .feature-icon-large {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: var(--radius-xl);
          color: var(--color-primary-light);
        }

        .feature-icon {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
          border-radius: var(--radius-lg);
          color: var(--color-primary-light);
        }

        .feature-preview {
          margin-top: auto;
          padding-top: var(--space-6);
        }

        .intensity-preview {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }

        .chart-preview {
          display: flex;
          gap: var(--space-2);
          align-items: flex-end;
          height: 80px;
          margin-top: auto;
          padding-top: var(--space-4);
        }

        .chart-bar {
          flex: 1;
          background: linear-gradient(to top, var(--color-primary) 0%, var(--color-secondary) 100%);
          border-radius: var(--radius-sm) var(--radius-sm) 0 0;
          opacity: 0.7;
        }

        /* How It Works */
        .how-it-works-section {
          padding: var(--space-20) var(--space-8);
          max-width: 1200px;
          margin: 0 auto;
        }

        .steps-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--space-6);
        }

        .step-card {
          flex: 1;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          text-align: center;
          backdrop-filter: blur(20px);
          position: relative;
        }

        .step-number {
          position: absolute;
          top: var(--space-4);
          right: var(--space-4);
          font-size: 2rem;
          font-weight: 800;
          font-family: var(--font-display);
          color: rgba(99, 102, 241, 0.2);
        }

        .step-icon {
          width: 72px;
          height: 72px;
          margin: 0 auto var(--space-6);
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.15));
          border-radius: var(--radius-xl);
          color: var(--color-primary-light);
        }

        .step-card h4 {
          margin-bottom: var(--space-3);
        }

        .step-connector {
          color: var(--color-text-muted);
        }

        /* CTA Section */
        .cta-section {
          padding: var(--space-20) var(--space-8);
          text-align: center;
        }

        .cta-content {
          max-width: 600px;
          margin: 0 auto;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-2xl);
          padding: var(--space-12);
          backdrop-filter: blur(20px);
        }

        .cta-content h2 {
          margin-bottom: var(--space-4);
        }

        .cta-content p {
          margin-bottom: var(--space-8);
          font-size: 1.125rem;
        }

        /* Footer */
        .footer {
          padding: var(--space-8);
          border-top: 1px solid var(--color-border);
        }

        .footer-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .footer-brand {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-weight: 600;
        }

        .footer-copy {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero-visual {
            display: none;
          }

          .steps-container {
            flex-direction: column;
          }

          .step-connector {
            transform: rotate(90deg);
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 0 var(--space-4);
          }

          .nav-links {
            display: none;
          }

          .hero {
            padding: calc(64px + var(--space-8)) var(--space-4) var(--space-8);
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-description {
            font-size: 1rem;
          }

          .hero-actions {
            flex-direction: column;
          }

          .features-section,
          .how-it-works-section {
            padding: var(--space-12) var(--space-4);
          }

          .footer-content {
            flex-direction: column;
            gap: var(--space-4);
            text-align: center;
          }
        }
      `}</style>
        </div>
    )
}
