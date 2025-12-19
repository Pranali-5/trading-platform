"use client";
import { useState, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import Dashboard from "@/components/Dashboard";
import Watchlist from "@/components/Watchlist";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  const notifications = useNotifications();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMarketOpen, setIsMarketOpen] = useState(true);

  const userId = "user123";

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Check if market is open (simplified - 9:30 AM to 4:00 PM EST on weekdays)
      const hour = new Date().getHours();
      const day = new Date().getDay();
      setIsMarketOpen(day >= 1 && day <= 5 && hour >= 9 && hour < 16);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg glow-primary">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-foreground">Trade</h1>
                <p className="text-xs text-foreground-muted hidden sm:block">Real-Time Trading</p>
              </div>
            </div>

            {/* Market Status & Time */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-profit pulse-live' : 'bg-loss'}`} />
                <span className="text-sm font-medium text-foreground-muted">
                  {isMarketOpen ? 'Market Open' : 'Market Closed'}
                </span>
              </div>
              <div className="text-sm font-mono text-foreground-muted tabular-nums">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  hour12: true
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <button className="btn-icon relative">
                  <svg className="w-5 h-5 text-foreground-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-loss text-white text-xs rounded-full flex items-center justify-center">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Sidebar */}
          <aside className="xl:col-span-3 space-y-6">
            {/* Watchlist */}
            <Watchlist userId={userId} onSelectSymbol={setSelectedSymbol} />

            {/* Notifications Panel */}
            <div className="card p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                  <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  Alerts
                </h2>
                {notifications.length > 0 && (
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                    {notifications.length} new
                  </span>
                )}
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-foreground-subtle opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-sm text-foreground-muted">No alerts yet</p>
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-secondary rounded-lg border border-border hover:border-border-hover transition-colors animate-slide-up"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 mt-1.5 rounded-full bg-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-foreground truncate">
                            {n.title || 'Alert'}
                          </div>
                          <div className="text-xs text-foreground-muted line-clamp-2">
                            {n.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>

          {/* Main Dashboard */}
          <div className="xl:col-span-9">
            <Dashboard selectedSymbol={selectedSymbol} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50">
        <div className="container mx-auto px-4 lg:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-foreground-muted">
              <span>© {new Date().getFullYear()} TradePro</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline">Real-Time Market Data</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-foreground-subtle">
              <span className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-profit pulse-live" />
                WebSocket Connected
              </span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
