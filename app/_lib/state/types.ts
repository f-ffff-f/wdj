export interface IPlaylist {
    id: string
    name: string
}
export interface ITrack {
    id: string
    fileName: string
    playlistIds: string[]
    url?: string
}
