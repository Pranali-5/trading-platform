"use client";
import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import Dashboard from "@/components/Dashboard";
import Watchlist from "@/components/Watchlist";
import ThemeToggle from "@/components/ThemeToggle";

export default function HomePage() {
  const notifications = useNotifications();
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);

  // Mock user ID - in a real app, this would come from authentication
  const userId = "user123";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Trading Platform</h1>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with Watchlist */}
          <div className="lg:col-span-1">
            <Watchlist userId={userId} onSelectSymbol={setSelectedSymbol} />

            {/* Notifications Panel */}
            <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold mb-4">Notifications</h2>
              <div className="space-y-2">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                ) : (
                  notifications.slice(0, 5).map((n, idx) => (
                    <div key={idx} className="p-3 bg-gray-100 dark:bg-gray-700 rounded">
                      <div className="font-medium">{n.title || 'Notification'}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{n.message}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-3">
            <Dashboard />
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-800 mt-auto py-6 border-t border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 text-center text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Trading Platform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}


