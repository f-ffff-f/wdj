'use client'

import { signInAction } from '@/app/(auth)/_actions/signIn'
import { Button } from '@/lib/client/components/ui/button'
import { Input } from '@/lib/client/components/ui/input'
import { Label } from '@/lib/client/components/ui/label'
import TurnstileWidget from '@/lib/client/components/utils/TurnstileWidget'
import Link from 'next/link'
import { useReducer } from 'react'

type formState = {
    email: string
    password: string
    turnstileToken: string
    resetTrigger: number
    isTurnstilePending: boolean
}

type Action =
    | {
          type: 'SET_EMAIL'
          payload: string
      }
    | {
          type: 'SET_PASSWORD'
          payload: string
      }
    | {
          type: 'SET_TURNSTILE_TOKEN'
          payload: string
      }
    | {
          type: 'SET_RESET_TRIGGER'
          payload: number
      }
    | {
          type: 'SET_IS_TURNSTILE_PENDING'
          payload: boolean
      }

const reducer = (state: formState, action: Action) => {
    switch (action.type) {
        case 'SET_EMAIL':
            return { ...state, email: action.payload }
        case 'SET_PASSWORD':
            return { ...state, password: action.payload }
        case 'SET_TURNSTILE_TOKEN':
            return { ...state, turnstileToken: action.payload }
        case 'SET_RESET_TRIGGER':
            return { ...state, resetTrigger: action.payload }
        case 'SET_IS_TURNSTILE_PENDING':
            return { ...state, isTurnstilePending: action.payload }
    }
}

const SignIn = () => {
    const [state, dispatch] = useReducer(reducer, {
        email: 'test@user.com',
        password: 'test1234',
        turnstileToken: '',
        resetTrigger: 0,
        isTurnstilePending: true,
    })

    const handleTokenChange = (token: string) => {
        dispatch({ type: 'SET_TURNSTILE_TOKEN', payload: token })
        dispatch({ type: 'SET_IS_TURNSTILE_PENDING', payload: false })
    }

    const handleSubmit = async (submitType: 'userSignin' | 'guestSignin') => {
        // Create a FormData object manually
        const formData = new FormData()
        formData.append('email', state.email)
        formData.append('password', state.password)
        formData.append('turnstileToken', state.turnstileToken)
        formData.append(submitType, 'true')

        // Call the server action
        const { success, error } = await signInAction(formData)

        if (!success) {
            alert(error)
        }

        // Reset the Turnstile widget after submission
        dispatch({ type: 'SET_RESET_TRIGGER', payload: state.resetTrigger + 1 })
        dispatch({ type: 'SET_IS_TURNSTILE_PENDING', payload: true })
        return { success, message: message ?? '' }
    }

    return (
        <div className="max-w-md m-auto p-4">
            <div>
                <fieldset disabled={process.env.NEXT_PUBLIC_IS_CI ? false : state.isTurnstilePending}>
                    <div className="flex flex-col gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            type="email"
                            id="email"
                            value={state.email}
                            onChange={(e) => dispatch({ type: 'SET_EMAIL', payload: e.target.value })}
                            data-testid="email-input"
                        />

                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            value={state.password}
                            onChange={(e) => dispatch({ type: 'SET_PASSWORD', payload: e.target.value })}
                            data-testid="password-input"
                        />

                        <input type="hidden" value={state.turnstileToken} />

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

                <TurnstileWidget onTokenChange={handleTokenChange} resetTrigger={state.resetTrigger} />
            </div>
        </div>
    )
}

export default SignIn
