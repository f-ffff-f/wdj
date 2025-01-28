import { UserDTO } from './dto'
import { PlaylistDTO } from './dto'

// api/user/me
export type UserMeAPI = { Response: UserDTO }

// api/user/login
export type UserLoginAPI = {
    Request: { email: string; password: string }
    Response: { message: string; token: string } & UserDTO
}

// api/playlist
export type GetPlaylistsAPI = {
    Response: PlaylistDTO[]
}

// api/playlist/create
export type CreatePlaylistAPI = {
    Request: { name: string }
    Response: PlaylistDTO
}

// api/playlist/update
export type UpdatePlaylistAPI = {
    Request: { name: string }
    Response: PlaylistDTO
}

// api/playlist/delete
export type DeletePlaylistAPI = {
    Response: { message: string }
}
