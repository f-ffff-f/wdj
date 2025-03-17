import { useQueryClient } from '@tanstack/react-query'

export const useLogout = () => {
    const queryClient = useQueryClient()

    const logout = async () => {
        // 모든 토큰 제거
        clearAllTokens()

        // 캐시된 쿼리 무효화
        await queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['/api/tracks'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] }),
        ])
    }

    return { logout }
}
