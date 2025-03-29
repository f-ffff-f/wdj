import { getPlaylists, getTracks } from '@/app/main/actions'
import { auth } from '@/auth'
import MainView from '@/components/MainView'
import { Playlist } from '@prisma/client'
import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query'
import { notFound } from 'next/navigation'

const DEFAULT_PLAYLIST_ID = 'library'

type MainProps = {
    params: Promise<{ playlistId: string }>
}

const PlaylistPage = async ({ params }: MainProps) => {
    const { playlistId } = await params

    const queryClient = new QueryClient()

    // 세션의 사용자 ID로 플레이리스트 목록을 가져와 유효성 검증
    await queryClient.prefetchQuery({
        queryKey: ['playlists'],
        queryFn: getPlaylists,
    })
    const userPlaylists = queryClient.getQueryData<Playlist[]>(['playlists'])
    const isValidPlaylist = userPlaylists?.some((playlist) => playlist.id === playlistId)

    // 현재 사용자의 플레이리스트가 아니면 not-found 처리
    if (!isValidPlaylist) {
        notFound()
    }

    // 플레이리스트 ID에 해당하는 트랙 데이터 미리 가져오기
    await queryClient.prefetchQuery({
        queryKey: ['tracks', playlistId],
        queryFn: () => getTracks(playlistId),
    })

    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <MainView />
        </HydrationBoundary>
    )
}

export default PlaylistPage
