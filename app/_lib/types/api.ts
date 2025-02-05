import { TrackDTO, UserDTO } from '../backend/types/dto'
import { PlaylistDTO } from '../backend/types/dto'

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

// api/playlist/[playlistId]/tracks
export type AddTracksToPlaylistAPI = {
    Request: { trackIds: string[] }
    Response: PlaylistDTO
}

// api/tracks
export type GetTracksAPI = {
    Response: TrackDTO[]
}

// api/track/create
export type CreateTrackAPI = {
    Request: { fileName: string; playlistId?: string }
    Response: TrackDTO
}

// api/track/[id]/delete
export type DeleteTrackAPI = {
    Response: { message: string }
}
