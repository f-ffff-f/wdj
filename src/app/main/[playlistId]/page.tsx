// src/app/main/[playlistId]/page.tsx
import FileUploader from '@/app/main/components/DJController/Library/FileUploader'
import TrackList from '@/app/main/components/DJController/Library/TrackList'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'

type Props = {
    params: Promise<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>
}

const PlaylistPage = async ({ params }: Props) => {
    const { playlistId } = await params

    return (
        <div className="w-full md:w-[500px] text-center flex flex-col gap-4">
            <FileUploader />
            <TrackList playlistId={playlistId} />
        </div>
    )
}

export default PlaylistPage
