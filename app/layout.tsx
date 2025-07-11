import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from './components/Header'
import NavBar from './components/NavBar'
import MainWrapper from './components/MainWrapper'
import Link from 'next/link';
import { cookies } from 'next/headers';

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
        <NavBar />
        <MainWrapper>{children}</MainWrapper>
      </body>
    </html>
  )
}
