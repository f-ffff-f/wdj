import { useQueryClient } from '@tanstack/react-query'
import { customFetcher } from '@/lib/client/utils/customFetcher'

export const useLogout = () => {
    const queryClient = useQueryClient()

    const logout = async () => {
        // 서버에 로그아웃 요청 - 서버가 쿠키 삭제
        try {
            await customFetcher('/api/user/logout', {
                method: 'POST',
            })
        } catch (error) {
            alert(error)
        }

        // 캐시된 쿼리 무효화
        await queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['/api/tracks'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] }),
        ])
    }

    return { logout }
}
