import { PlaylistDTO, UserDTO } from './dto'

type APIError = {
    error: string
}

// 제네릭 API 응답 타입 생성
type ApiResponse<T> = T | APIError

// api/user/me
export type UserMeAPI = {
    Response: ApiResponse<UserDTO>
}

// api/user/login
export type UserLoginAPI = {
    Request: { email: string; password: string }
    Response: ApiResponse<{ message: string; token: string } & UserDTO>
}

// api/playlist/create
export type CreatePlaylistAPI = {
    Request: {
        name: string
    }
    Response: ApiResponse<PlaylistDTO>
}

// api/playlist/read
export type GetPlaylistAPI = {
    Request: {
        id: string
    }
    Response: ApiResponse<PlaylistDTO>
}

// api/playlist/read-all
export type GetPlaylistsAPI = {
    Response: ApiResponse<PlaylistDTO[]>
}

// api/playlist/update
export type UpdatePlaylistAPI = {
    Request: {
        id: string
        name?: string
    }
    Response: ApiResponse<PlaylistDTO>
}

// api/playlist/delete
export type DeletePlaylistAPI = {
    Request: {
        id: string
    }
    Response: ApiResponse<{ message: string; id: string }>
}
