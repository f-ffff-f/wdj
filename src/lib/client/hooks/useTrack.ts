import { customFetcher } from '@/lib/client/utils/customFetcher'
import { Track } from '@prisma/client'
import { useQuery } from '@tanstack/react-query'

const BASE_URL = '/api/tracks'
const QUERY_KEY = [BASE_URL]

export const useTrack = () => {
    // 트랙 목록 조회 쿼리
    const tracksQuery = useQuery<Track[]>({
        queryKey: QUERY_KEY,
        queryFn: () => customFetcher(BASE_URL),
        staleTime: 1000 * 60 * 10,
    })

    // 단일 트랙의 blob | presigned URL => blob 가져오기 함수

    return {
        tracksQuery: tracksQuery.data,
        isLoading: tracksQuery.isLoading,
        error: tracksQuery.error,
    }
}
