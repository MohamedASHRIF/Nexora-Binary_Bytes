import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Nexora Campus Copilot',
  description: 'Your smart assistant for campus life',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark:bg-slate-900">
      <body className={`${inter.className} bg-white dark:bg-slate-900 text-gray-900 dark:text-white transition-colors duration-200`}>
        <Header />
        {/* Global Navigation Bar */}
        <nav className="fixed top-16 left-0 right-0 z-40 w-full flex items-center bg-white dark:bg-slate-800 justify-end px-8 py-2 gap-6 border-t border-gray-100 dark:border-slate-700 shadow-sm">
          {/* Language Selector on the left */}
          <div className="flex items-center gap-2 mr-auto">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Language</span>
            <select
              // You may want to lift language state up to a context for global use
              className="border rounded px-2 py-1 text-xs bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              style={{ minWidth: 80 }}
              aria-label="Select language"
              defaultValue="en"
              // onChange handler can be added for global language switching
            >
              <option value="en">English</option>
              <option value="si">සිංහල</option>
              <option value="ta">தமிழ்</option>
            </select>
          </div>
          {/* Main Nav Links */}
          <Link
            href="/"
            className="px-4 py-2 rounded font-semibold transition-colors bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
          >
            Home
          </Link>
          <Link
            href="/chat"
            className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
          >
            Chat
          </Link>
          <Link
            href="/map"
            className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
          >
            Map
          </Link>
          <Link
            href="/insights"
            className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
          >
            Insights
          </Link>
          <Link
            href="/forum"
            className="px-4 py-2 rounded font-semibold transition-colors bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-slate-600"
          >
        Forum
          </Link>
        </nav>
        <main className="pt-36">{children}</main>
      </body>
    </html>
  )
}
