import { getPlaylists, getTracks } from '@/app/main/actions'
import DJController from '@/components/MainView/DJController'
import Shortcuts from '@/components/MainView/Shortcuts'
import TrackList from '@/components/MainView/TrackLibrary/TrackList'
import Debugger from '@/lib/client/components/Debugger'
import { detectMobileDevice } from '@/lib/server/detectMobileDevice'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'
import { Playlist } from '@prisma/client'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { notFound } from 'next/navigation'

type Props = {
    params: Promise<{ playlistId: string | typeof PLAYLIST_DEFAULT_ID }>
}

const PlaylistPage = async ({ params }: Props) => {
    const { playlistId: playlistIdParam } = await params
    const { isMobileDevice } = await detectMobileDevice()

    const queryClient = new QueryClient()

    // 세션의 사용자 ID로 플레이리스트 목록을 가져와 유효성 검증
    await queryClient.prefetchQuery({
        queryKey: ['playlists'],
        queryFn: getPlaylists,
    })
    const userPlaylists = queryClient.getQueryData<Playlist[]>(['playlists'])
    const isValidPlaylist =
        PLAYLIST_DEFAULT_ID === playlistIdParam || userPlaylists?.some((playlist) => playlist.id === playlistIdParam)

    if (!isValidPlaylist) {
        notFound()
    }

    // 플레이리스트 ID에 해당하는 트랙 데이터 미리 가져오기
    await queryClient.prefetchQuery({
        queryKey: ['tracks', playlistIdParam],
        queryFn: () => getTracks(playlistIdParam),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            {isMobileDevice ? (
                <DJController>
                    <TrackList />
                </DJController>
            ) : (
                <Shortcuts>
                    <DJController>
                        <TrackList />
                    </DJController>
                    {process.env.NODE_ENV === 'development' && <Debugger />}
                </Shortcuts>
            )}
        </HydrationBoundary>
    )
}

export default PlaylistPage
