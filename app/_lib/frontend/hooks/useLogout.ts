import { useQueryClient } from '@tanstack/react-query'

export const useLogout = () => {
    const queryClient = useQueryClient()

    const logout = () => {
        localStorage.removeItem('token')
        queryClient.setQueryData(['/api/user/me'], null)
        queryClient.invalidateQueries({ queryKey: ['/api/user/me'] })
        queryClient.invalidateQueries({ queryKey: ['/api/tracks'] })
        queryClient.invalidateQueries({ queryKey: ['/api/playlist'] })
    }

    return { logout }
}
