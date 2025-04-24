// src/app/main/[playlistId]/page.tsx
import { getIsValidPlaylist } from '@/app/main/_actions/playlist'
import FileUploader from '@/app/main/components/DJController/Library/FileUploader'
import TrackList from '@/app/main/components/DJController/Library/TrackList'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { notFound } from 'next/navigation'
import { Fragment } from 'react'

type Props = {
    params: Promise<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>
}

const PlaylistPage = async ({ params }: Props) => {
    const { playlistId } = await params

    const isValidPlaylist = await getIsValidPlaylist(playlistId)

    if (!isValidPlaylist) {
        notFound()
    }

    return (
        <Fragment>
            <FileUploader />
            <TrackList playlistId={playlistId} />
        </Fragment>
    )
}

export default PlaylistPage
