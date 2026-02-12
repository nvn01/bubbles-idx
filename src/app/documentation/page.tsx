import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "Documentation — Bubbles IDX",
    description: "About Bubbles IDX, data sources, terms of use, and project documentation.",
}

export default function DocumentationPage() {
    return (
        <div style={{ position: "fixed", inset: 0, overflowY: "auto", background: "#fff" }}>
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "40px 20px", fontFamily: "system-ui, sans-serif" }}>
                <h1>Bubbles IDX — Documentation</h1>
                <p><em>Last updated: February 12, 2026</em></p>

                <hr />

                <h2>About This Project</h2>
                <p>
                    Bubbles IDX is an interactive stock market visualizer for the Indonesian Stock Exchange (IDX).
                    It displays real-time-ish stock price movements as floating bubbles — green when a stock is up,
                    red when it&apos;s down, and sized by how much it moved.
                </p>
                <p>
                    The idea came from <a href="https://banterbubbles.com/" target="_blank" rel="noopener noreferrer">BanterBubbles</a>,
                    a crypto market visualizer. I thought it would be cool to have something similar but for the Indonesian
                    stock market, so I built it. What started as a college project for my portfolio turned into something I
                    genuinely enjoy working on, so I kept going even after graduating.
                </p>

                <hr />

                <h2>Data Sources</h2>

                <h3>Stock Price Data</h3>
                <p>
                    Ticker prices (last price, bid, ask, and price changes) come from TradingView&apos;s publicly accessible data.
                    This is <strong>not</strong> sourced from any brokerage API — it&apos;s the same public feed available to anyone.
                </p>
                <p>
                    Because of this, all price data displayed on Bubbles IDX is <strong>delayed by 10 minutes</strong>. This is in
                    compliance with Bursa Efek Indonesia&apos;s data licensing terms:
                </p>
                <blockquote>
                    <p>
                        Terhitung mulai tanggal 04 November 2024, Price (Last, Bid, Ask) pada menu Watchlist, Stock Overview,
                        Movers dan Chart akan disajikan secara delay selama 10 menit untuk memenuhi Ketentuan Umum Penggunaan
                        Lisensi Bursa Efek Indonesia mengenai penggunaan data realtime.
                    </p>
                </blockquote>

                <h3>Stock Listings &amp; Index Data</h3>
                <p>
                    The full list of stocks, index compositions (like IDX80, LQ45, etc.), corporate calendar events,
                    and broker summary data are all sourced from the official Indonesia Stock Exchange website
                    at <a href="https://www.idx.co.id/id/" target="_blank" rel="noopener noreferrer">idx.co.id</a>.
                </p>

                <h3>News</h3>
                <p>
                    Market news is aggregated through a separate scraping project I built:&nbsp;
                    <a href="https://github.com/nvn01/idx-news-scrapper" target="_blank" rel="noopener noreferrer">
                        idx-news-scrapper
                    </a>.
                    It collects headlines from various Indonesian financial news sources and makes them available through an API.
                </p>

                <hr />

                <h2>10-Minute Data Delay</h2>
                <p>
                    To be clear: <strong>this is not a real-time data platform</strong>. All price data shown here is delayed by
                    approximately 10 minutes. This delay exists because BEI (Bursa Efek Indonesia) requires it for non-licensed
                    use of their market data. If you need real-time data, please use your broker&apos;s trading platform.
                </p>

                <hr />

                <h2>Disclaimer</h2>
                <p>
                    This is a <strong>personal project</strong>. I started building it as a college portfolio project, kept working on
                    it because I genuinely enjoyed the process, and eventually finished it after graduating. It is not a commercial
                    product, not a financial advisory tool, and not affiliated with any brokerage or financial institution.
                </p>
                <p>
                    Nothing on this website should be taken as financial advice. The data is delayed, may contain
                    inaccuracies, and is provided as-is for informational and educational purposes only. Always do your own
                    research and consult a licensed financial advisor before making investment decisions.
                </p>

                <hr />

                <h2>Open Source</h2>
                <p>
                    The entire source code for Bubbles IDX is publicly available on GitHub:&nbsp;
                    <a href="https://github.com/nvn01/bubbles-idx" target="_blank" rel="noopener noreferrer">
                        github.com/nvn01/bubbles-idx
                    </a>
                </p>
                <p>
                    Feel free to look around, open issues, or fork it for your own use.
                </p>

                <hr />

                <h2>Privacy</h2>
                <p>
                    Bubbles IDX does not collect personal data. Theme preferences, language settings, and watchlists
                    are stored locally in your browser using localStorage. No accounts, no tracking, no cookies beyond
                    what&apos;s technically necessary.
                </p>

                <hr />

                <h2>Contact</h2>
                <p>
                    If you find a bug, have a question, or just want to say hi — feel free to open an issue on the&nbsp;
                    <a href="https://github.com/nvn01/bubbles-idx/issues" target="_blank" rel="noopener noreferrer">
                        GitHub repo
                    </a>.
                </p>

                <br />
                <p><small>&copy; 2026 Bubbles IDX. Personal project, not for commercial use.</small></p>
            </div>
        </div>
    )
}
