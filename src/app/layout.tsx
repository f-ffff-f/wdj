import type { Metadata } from 'next'
import './globals.css'
import { EnvironmentIndicator } from '@/components/Debugger/EnvironmentIndicator'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
    title: 'Create Next App',
    description: 'Generated by create next app',
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en" className="dark">
            <body className={`antialiased`}>
                <EnvironmentIndicator />
                {children}
                <Analytics />
            </body>
        </html>
    )
}
