// Updated File: src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Providers from '@/utils/providers'
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/components/ThemeProvider'; // <-- 1. Import ThemeProvider

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SehatSetu',
  description: 'Digital Healthcare Platform for Doctors and Pharmacies',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    // 2. Add suppressHydrationWarning (required by next-themes)
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* 3. Wrap everything with ThemeProvider */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <AuthProvider>
              <Toaster position="top-center" reverseOrder={false} />
              {children}
            </AuthProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
