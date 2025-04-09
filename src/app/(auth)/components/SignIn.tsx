'use client'

import { Button } from '@/lib/client/components/ui/button'
import { Input } from '@/lib/client/components/ui/input'
import { Label } from '@/lib/client/components/ui/label'
import TurnstileWidget from '@/lib/client/components/utils/TurnstileWidget'
import Link from 'next/link'
import { useActionState, useState } from 'react'
import { signInAction } from '@/app/(auth)/_actions/signIn'

const SignIn = () => {
    const [turnstileToken, setTurnstileToken] = useState<string>('')
    const [resetTrigger, setResetTrigger] = useState<number>(0)
    const [isTurnstilePending, setIsTurnstilePending] = useState(true)
    const [email, setEmail] = useState('test@user.com')
    const [password, setPassword] = useState('test1234')

    const handleTokenChange = (token: string) => {
        setTurnstileToken(token)
        setIsTurnstilePending(false)
    }

    const handleSubmit = async (submitType: 'userSignin' | 'guestSignin') => {
        // Create a FormData object manually
        const formData = new FormData()
        formData.append('email', email)
        formData.append('password', password)
        formData.append('turnstileToken', turnstileToken)
        formData.append(submitType, 'true')

        // Call the server action
        const { success, message } = await signInAction({ success: false, message: '' }, formData)

        if (!success) {
            alert(message)
        }

        // Reset the Turnstile widget after submission
        setResetTrigger((prev) => prev + 1)
        setIsTurnstilePending(true)
        return { success, message: message ?? '' }
    }

    const [, formAction, isPending] = useActionState(
        async (prevState: { success: boolean; message: string }, formData: FormData) => {
            // This function is still needed for useActionState hook but we won't directly use it
            return prevState
        },
        {
            success: false,
            message: '',
        },
    )

    return (
        <div className="max-w-md m-auto p-4">
            <div>
                <fieldset disabled={process.env.NEXT_PUBLIC_IS_CI ? false : isPending || isTurnstilePending}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            data-testid="email-input"
                        />

                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            data-testid="password-input"
                        />

                        <input type="hidden" value={turnstileToken} />

                        <Button
                            onClick={() => handleSubmit('userSignin')}
                            className="w-full"
                            data-testid="signin-button"
                        >
                            Sign In
                        </Button>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <Button
                            onClick={() => handleSubmit('guestSignin')}
                            variant="link"
                            size="sm"
                            data-testid="guest-signin-button"
                        >
                            Continue as Guest
                        </Button>
                        <Button variant="link" size="sm">
                            <Link href="/signup">Sign Up</Link>
                        </Button>
                    </div>
                </fieldset>

                <TurnstileWidget onTokenChange={handleTokenChange} resetTrigger={resetTrigger} />
            </div>
        </div>
    )
}

export default SignIn
