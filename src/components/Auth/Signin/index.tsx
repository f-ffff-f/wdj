'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TurnstileWidget from '@/components/utils/TurnstileWidget'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signInAction } from '@/app/(auth)/_actions/signIn'

const SignIn = () => {
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [resetTrigger, setResetTrigger] = useState<number>(0)
    const [isTurnstilePending, setIsTurnstilePending] = useState(true)

    const handleTokenChange = (token: string) => {
        setTurnstileToken(token)
        setIsTurnstilePending(false)
    }

    const handleAction = async (prevState: { success: boolean; message: string }, formData: FormData) => {
        // Add the turnstile token to the form data
        formData.append('turnstileToken', turnstileToken)

        // Determine which button was clicked
        const submitButton = document.activeElement as HTMLButtonElement
        if (submitButton?.name) {
            formData.append(submitButton.name, submitButton.value)
        }

        // Call the server action
        const { success, message } = await signInAction(prevState, formData)

        if (!success) {
            alert(message)
        }

        // Reset the Turnstile widget after submission
        setResetTrigger((prev) => prev + 1)
        setIsTurnstilePending(true)
        return { success, message: message ?? '' }
    }

    const [, formAction, isPending] = useActionState(handleAction, {
        success: false,
        message: '',
    })

    return (
        <div className="max-w-md m-auto p-4">
            <form action={formAction}>
                <fieldset disabled={process.env.GITHUB_ACTIONS === 'true' ? false : isPending || isTurnstilePending}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input type="email" name="email" defaultValue={'test@user.com'} />

                        <Label htmlFor="password">Password</Label>
                        <Input type="password" name="password" defaultValue={'test1234'} />

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
