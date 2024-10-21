export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div>
            Dashboard Layout
            {children}
        </div>
    )
}
