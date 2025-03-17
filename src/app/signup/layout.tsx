import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
    title: 'Sign Up - WDJ',
    description: 'Create an account for the Web DJ service',
}

const SignupLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 md:p-8">
            <div className="w-full max-w-md">{children}</div>
        </div>
    )
}

export default SignupLayout
