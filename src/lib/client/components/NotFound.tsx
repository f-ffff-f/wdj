import { Button } from '@/components/ui/button'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import Link from 'next/link'

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Page Not Found</h2>
            <Button asChild>
                <Link href={`/main/${PLAYLIST_DEFAULT_ID}`}>Go to Library</Link>
            </Button>
        </div>
    )
}

export default NotFound
