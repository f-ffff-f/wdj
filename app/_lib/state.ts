import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'
import { v4 as uuidv4 } from 'uuid'

type IPlaylist = {
    id: string
    name: string
}

type ITrack = {
    id: string
    fileName: string
    playlistIds: string[]
    url: string
}

interface IState {
    UI: {
        currentPlaylistId: string
        focusedTrackId: string
    }
    guest: {
        playlists: IPlaylist[]
        tracks: ITrack[]
    }
}

export const state = proxy<IState>({
    UI: { currentPlaylistId: '', focusedTrackId: '' },
    guest: {
        playlists: [],
        tracks: [],
    },
})

// 라이브러리에 트랙 추가 함수
const addTrackToLibrary = async (file: File) => {
    const trackId = uuidv4()

    const track: ITrack = {
        id: trackId,
        fileName: file.name,
        playlistIds: state.UI.currentPlaylistId ? [state.UI.currentPlaylistId] : [],
        url: URL.createObjectURL(file),
    }

    state.guest.tracks.push(track)

    state.UI.focusedTrackId = trackId // 새로 추가된 트랙을 포커스
}

const deleteTrackFromLibrary = async (trackId: string) => {
    state.guest.tracks = state.guest.tracks.filter((track) => track.id !== trackId)
}

const createPlaylist = async (newPlaylistName: string) => {
    const playlist: IPlaylist = {
        id: uuidv4(),
        name: newPlaylistName,
    }
    state.guest.playlists.push(playlist)
}

const updatePlaylist = async (params: { id: string; name: string }, context: { onSuccess: () => void }) => {
    const playlist = state.guest.playlists.find((playlist) => playlist.id === params.id)
    if (playlist) {
        playlist.name = params.name
    }
    context.onSuccess()
}

const deletePlaylist = async (playlistId: string) => {
    state.guest.playlists = state.guest.playlists.filter((playlist) => playlist.id !== playlistId)
    state.guest.tracks.forEach((track) => {
        track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
    })
}

const addTracksToPlaylist = async ({ id, trackIds }: { id: string; trackIds: string[] }) => {
    state.guest.tracks.find((track) => trackIds.includes(track.id))?.playlistIds.push(id)
}

const deleteTracksFromPlaylist = async (trackIds: string[]) => {
    state.guest.tracks.forEach((track) => {
        if (trackIds.includes(track.id)) {
            track.playlistIds = track.playlistIds.filter((id) => id !== id)
        }
    })
}

export const valtioAction = {
    addTrackToLibrary,
    deleteTrackFromLibrary,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTracksToPlaylist,
    deleteTracksFromPlaylist,
}

const unsub = devtools(state, { name: 'state', enabled: true })
