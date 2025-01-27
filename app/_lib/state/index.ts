import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'
import { IPlaylist, ITrack } from '@/app/_lib/state/types'
import { generateId } from '@/app/_lib/state/utils'
interface IState {
    auth: {
        isAuthenticated: boolean
        user: {
            id: string
            email: string
        } | null
    }
    vault: {
        currentPlaylistId: string
        focusedTrackId: string
        playlists: IPlaylist[]
        tracks: ITrack[]
    }
}

export const state = proxy<IState>({
    auth: {
        isAuthenticated: false,
        user: null,
    },
    vault: {
        currentPlaylistId: '',
        focusedTrackId: '',
        playlists: [],
        tracks: [],
    },
})

const isDuplicateTrack = async (trackId: string): Promise<boolean> => {
    if (state.vault.tracks.some((track) => track.id === trackId)) {
        return true
    } else {
        return false
    }
}

const isDuplicatePlaylist = async (playlistId: string): Promise<boolean> => {
    if (state.vault.playlists.some((playlist) => playlist.id === playlistId)) {
        return true
    } else {
        return false
    }
}

const isDuplicateTrackInPlaylist = async (trackId: string, playlistId: string): Promise<boolean> => {
    const track = state.vault.tracks.find((track) => track.id === trackId)
    return track?.playlistIds.includes(playlistId) ?? false
}

// 라이브러리에 트랙 추가 함수
export const addTrackToLibrary = async (file: File) => {
    const trackId = generateId(file.name)
    const duplicate = await isDuplicateTrack(trackId)

    if (duplicate) {
        alert('이미 동일한 파일이 라이브러리에 존재합니다: ' + file.name)
        return
    }

    const track: ITrack = {
        id: trackId,
        fileName: file.name,
        playlistIds: state.vault.currentPlaylistId ? [state.vault.currentPlaylistId] : [],
    }

    state.vault.tracks.push({ ...track, url: URL.createObjectURL(file) })

    state.vault.focusedTrackId = trackId // 새로 추가된 트랙을 포커스
}

export const deleteTrackFromLibrary = async (trackId: string) => {
    state.vault.tracks = state.vault.tracks.filter((track) => track.id !== trackId)
}

export const addPlaylist = async (newPlaylistName: string) => {
    const playlistId = generateId(newPlaylistName)
    const duplicate = await isDuplicatePlaylist(playlistId)

    if (duplicate) {
        alert('이미 동일한 플레이리스트가 존재합니다: ' + newPlaylistName)
        return
    }

    const playlist: IPlaylist = {
        id: playlistId,
        name: newPlaylistName,
    }
    state.vault.playlists.push(playlist)
}

export const renamePlaylist = async (prevPlaylistId: string, newName: string) => {
    const newPlaylistId = generateId(newName)
    const duplicate = await isDuplicatePlaylist(newPlaylistId)

    if (duplicate) {
        alert('이미 동일한 플레이리스트가 존재합니다: ' + newName)
        return
    }

    const playlist = state.vault.playlists.find((playlist) => playlist.id === prevPlaylistId)
    if (playlist) {
        playlist.id = newPlaylistId
        playlist.name = newName

        state.vault.tracks.forEach((track) => {
            if (track.playlistIds.includes(prevPlaylistId)) {
                track.playlistIds = track.playlistIds.filter((id) => id !== prevPlaylistId).concat(newPlaylistId)
            }
        })
    }
    state.vault.currentPlaylistId = newPlaylistId
}

export const deletePlaylist = async (playlistId: string) => {
    state.vault.playlists = state.vault.playlists.filter((playlist) => playlist.id !== playlistId)
    state.vault.tracks.forEach((track) => {
        track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
    })
}

export const addTrackToPlaylist = async (trackId: string, playlistId: string) => {
    const duplicate = await isDuplicateTrackInPlaylist(trackId, playlistId)
    if (duplicate) {
        alert('이미 동일한 트랙이 플레이리스트에 존재합니다: ' + trackId)
        return
    }
    state.vault.tracks.find((track) => track.id === trackId)?.playlistIds.push(playlistId)
}

export const deleteTrackFromPlaylist = async (trackId: string, playlistId: string) => {
    const track = state.vault.tracks.find((track) => track.id === trackId)

    if (track) {
        track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
    }
}

const unsub = devtools(state, { name: 'state', enabled: true })
