'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TurnstileWidget from '@/lib/client/components/TurnstileWidget'
import Link from 'next/link'
import { useState } from 'react'
import { signInAction } from '@/app/actions'

const SignIn = () => {
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [resetTrigger, setResetTrigger] = useState<number>(0)

    const handleTokenChange = (token: string) => {
        setTurnstileToken(token)
    }

    const handleAction = async (e: React.FormEvent<HTMLFormElement>) => {
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
        const result = await signInAction(formData)

        if (result.error) {
            alert(result.error)
        }
        // Reset the Turnstile widget after submission
        setResetTrigger((prev) => prev + 1)
    }

    return (
        <div className="max-w-md m-auto p-4">
            <form onSubmit={handleAction}>
                <fieldset disabled={false}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" name="email" />

                        <Label htmlFor="password">Password</Label>
                        <Input type="password" name="password" />

                        <input type="hidden" name="turnstileToken" value={turnstileToken} />

                        <Button type="submit" name="userSignin" value="true" className="w-full">
                            Sign In
                        </Button>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button type="submit" name="guestSignin" value="true" variant="link" size="sm">
                            Continue as Guest
                        </Button>
                        <Button variant="link" size="sm">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                </fieldset>

                <TurnstileWidget onTokenChange={handleTokenChange} resetTrigger={resetTrigger} />
            </form>
        </div>
    )
}

export default SignIn
