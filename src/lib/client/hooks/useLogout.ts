import { useQueryClient } from '@tanstack/react-query'

export const useLogout = () => {
    const queryClient = useQueryClient()

    const logout = async () => {
        localStorage.removeItem('token')
        sessionStorage.removeItem('guestToken')

        await queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })

        await Promise.all([
            queryClient.invalidateQueries({ queryKey: ['/api/tracks'] }),
            queryClient.invalidateQueries({ queryKey: ['/api/playlist'] }),
        ])
    }

    return { logout }
}
