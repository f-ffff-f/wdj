import { useEffect, useState } from 'react'

// Declare global types for Turnstile
declare global {
    interface Window {
        turnstile?: {
            render: (container: HTMLElement, options: TurnstileOptions) => string
            reset: (widgetId: string) => void
        }
        _cbTurnstile: (token: string) => void
    }
}

interface TurnstileOptions {
    sitekey: string
    callback: (token: string) => void
    'refresh-expired'?: string
    theme?: 'light' | 'dark'
    size?: 'normal' | 'compact'
}

interface TurnstileWidgetProps {
    onTokenChange: (token: string) => void
    resetTrigger: number
}

const TurnstileWidget = ({ onTokenChange, resetTrigger }: TurnstileWidgetProps) => {
    const [widgetId, setWidgetId] = useState<string | null>(null)

    useEffect(() => {
        window._cbTurnstile = (token: string) => {
            onTokenChange(token)
        }

        const timeoutId = setTimeout(() => {
            const container = document.querySelector('.cf-turnstile') as HTMLElement
            if (window.turnstile && container) {
                if (widgetId) {
                    window.turnstile.reset(widgetId)
                }
                const newWidgetId = window.turnstile.render(container, {
                    sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
                    callback: (token: string) => {
                        onTokenChange(token)
                    },
                    theme: 'dark',
                })
                setWidgetId(newWidgetId)
            }
        }, 100)

        return () => {
            clearTimeout(timeoutId)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [resetTrigger])

    return <div key={resetTrigger} className="cf-turnstile mt-4" />
}

export default TurnstileWidget
