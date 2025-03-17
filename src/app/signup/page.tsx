import { SignupForm } from '../../components/Signup/Form'

export default async function SignupPage() {
    return (
        <div className="space-y-6">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-gray-500">Create an account to use all features of WDJ</p>
            </div>
            <SignupForm />
        </div>
    )
}
