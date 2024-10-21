import { Avatar, AvatarFallback } from '@/components/ui/avatar'
export default async function Profile() {
    await new Promise((resolve) => setTimeout(resolve, 3000))

    return (
        <div>
            <Avatar>
                <AvatarFallback />
            </Avatar>
        </div>
    )
}
