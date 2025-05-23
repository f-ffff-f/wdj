import { QueryProvider } from '@/app/QueryProvider'
import { SessionProvider } from '@/app/SessionProvider'
import { ThemeProvider } from '@/app/ThemeProvider'
import { auth } from '@/auth'
import { DevEnvIndicator } from '@/lib/client/components/utils/DevEnvIndicator'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const geistMono = Geist_Mono({
    subsets: ['latin'],
    weight: ['400'],
    variable: '--font-geist-mono',
})

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const session = await auth()
    const sessionKey = new Date().valueOf()

    return (
        <html lang="en" className={`${geistMono.variable} dark`}>
            <body className={`antialiased`}>
                <SessionProvider session={session} sessionKey={sessionKey}>
                    <QueryProvider>
                        <ThemeProvider>{children}</ThemeProvider>
                        <ReactQueryDevtools />
                        <DevEnvIndicator />
                        <Analytics />
                        <SpeedInsights />
                    </QueryProvider>
                </SessionProvider>
            </body>
        </html>
    )
}
