import { SignupForm } from '@/app/(auth)/components/SignupForm'

export default async function SignupPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-gray-500">Cloud-Powered Access to Your Music Library Across All Devices</p>
            </div>
            <SignupForm />
        </div>
    )
}
