import { signIn } from '@/auth'
import TurnstileWidget from '@/lib/client/components/TurnstileWidget'

const TestSignin = () => {
    const handleAction = async (formData: FormData) => {
        'use server'

        // Extract the values you need from formData
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (formData.get('userSignin')) {
            signIn('credentials', {
                email,
                password,
                redirectTo: '/main',
            })
        } else if (formData.get('guestSignin')) {
            signIn('credentials', {
                email,
                password,
                redirectTo: '/main',
            })
        }
    }

    return (
        <form action={handleAction}>
            <input type="email" name="email" />
            <input type="password" name="password" />
            <button type="submit" name="userSignin" value="true">
                Sign In
            </button>
            <button type="submit" name="guestSignin" value="true">
                guest signin
            </button>
            <TurnstileWidget onTokenChange={() => {}} resetTrigger={0} />
        </form>
    )
}

export default TestSignin
