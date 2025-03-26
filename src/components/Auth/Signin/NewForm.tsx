'use client'

import { useState } from 'react'
import TurnstileWidget from '@/lib/client/components/TurnstileWidget'

interface SignInFormProps {
    action: (formData: FormData) => Promise<void>
}

const SignInForm = ({ action }: SignInFormProps) => {
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [resetTrigger, setResetTrigger] = useState<number>(0)

    const handleTokenChange = (token: string) => {
        setTurnstileToken(token)
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        // Get the form data
        const formData = new FormData(e.currentTarget)

        // Add the turnstile token to the form data
        formData.append('turnstileToken', turnstileToken)

        // Determine which button was clicked
        const submitButton = document.activeElement as HTMLButtonElement
        if (submitButton?.name) {
            formData.append(submitButton.name, submitButton.value)
        }

        // Call the server action
        const result = await action(formData)

        if (result.error) {
            alert(result.error)
        }
        // Reset the Turnstile widget after submission
        setResetTrigger((prev) => prev + 1)
    }

    return (
        <form onSubmit={handleSubmit}>
            <input type="email" name="email" />
            <input type="password" name="password" />
            <input type="hidden" name="turnstileToken" value={turnstileToken} />

            <button type="submit" name="userSignin" value="true">
                Sign In
            </button>
            <button type="submit" name="guestSignin" value="true">
                guest signin
            </button>

            <TurnstileWidget onTokenChange={handleTokenChange} resetTrigger={resetTrigger} />
        </form>
    )
}

export default SignInForm
