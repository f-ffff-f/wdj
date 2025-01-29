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

const isDuplicateTrack = async (trackId: string): Promise<boolean> => {
    if (state.guest.tracks.some((track) => track.id === trackId)) {
        return true
    } else {
        return false
    }
}

const isDuplicatePlaylist = async (playlistName: string): Promise<boolean> => {
    if (state.guest.playlists.some((playlist) => playlist.name === playlistName)) {
        return true
    } else {
        return false
    }
}

const isDuplicateTrackInPlaylist = async (trackId: string, playlistId: string): Promise<boolean> => {
    const track = state.guest.tracks.find((track) => track.id === trackId)
    return track?.playlistIds.includes(playlistId) ?? false
}

// 라이브러리에 트랙 추가 함수
const addTrackToLibrary = async (file: File) => {
    const trackId = uuidv4()
    const duplicate = await isDuplicateTrack(trackId)

    if (duplicate) {
        alert('이미 동일한 파일이 라이브러리에 존재합니다: ' + file.name)
        return
    }

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
    const duplicate = await isDuplicatePlaylist(newPlaylistName)

    if (duplicate) {
        alert('이미 동일한 플레이리스트가 존재합니다: ' + newPlaylistName)
        return
    }

    const playlist: IPlaylist = {
        id: uuidv4(),
        name: newPlaylistName,
    }
    state.guest.playlists.push(playlist)
}

const updatePlaylist = async ({ id, name }: { id: string; name: string }, { onSuccess }: { onSuccess: () => void }) => {
    const duplicate = await isDuplicatePlaylist(name)

    if (duplicate) {
        alert('이미 동일한 플레이리스트가 존재합니다: ' + name)
        return
    }

    const playlist = state.guest.playlists.find((playlist) => playlist.id === id)
    if (playlist) {
        playlist.name = name
    }

    onSuccess()
}

const deletePlaylist = async (playlistId: string) => {
    state.guest.playlists = state.guest.playlists.filter((playlist) => playlist.id !== playlistId)
    state.guest.tracks.forEach((track) => {
        track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
    })
}

const addTrackToPlaylist = async (trackId: string, playlistId: string) => {
    const duplicate = await isDuplicateTrackInPlaylist(trackId, playlistId)
    if (duplicate) {
        alert('이미 동일한 트랙이 플레이리스트에 존재합니다: ' + trackId)
        return
    }
    state.guest.tracks.find((track) => track.id === trackId)?.playlistIds.push(playlistId)
}

const deleteTrackFromPlaylist = async (trackId: string, playlistId: string) => {
    const track = state.guest.tracks.find((track) => track.id === trackId)

    if (track) {
        track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
    }
}

export const valtioAction = {
    addTrackToLibrary,
    deleteTrackFromLibrary,
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addTrackToPlaylist,
    deleteTrackFromPlaylist,
}

const unsub = devtools(state, { name: 'state', enabled: true })
