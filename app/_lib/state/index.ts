import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'
import { db } from './db'
import { IPlaylist, ITrack } from '@/app/_lib/state/types'
import { generateId } from '@/app/_lib/state/utils'
interface IState {
    vault: {
        currentPlaylistId: string
        focusedTrackId: string
        playlists: IPlaylist[]
        tracks: ITrack[]
    }
}

export const state = proxy<IState>({
    vault: {
        currentPlaylistId: '',
        focusedTrackId: '',
        playlists: [],
        tracks: [],
    },
})

const loadTracksFromDB = async () => {
    const tracks = await db.getAllTracks()
    state.vault.tracks = tracks
}

// IndexedDB와 상태에서 ID 중복 확인
const isDuplicateTrack = async (trackId: string): Promise<boolean> => {
    if (state.vault.tracks.some((track) => track.id === trackId)) {
        return true
    }

    const allTracks = await db.getAllTracks()
    return allTracks.some((track) => track.id === trackId)
}

const isDuplicatePlaylist = async (playlistId: string): Promise<boolean> => {
    if (state.vault.playlists.some((playlist) => playlist.id === playlistId)) {
        return true
    }

    const allPlaylists = await db.getAllPlaylists()
    return allPlaylists.some((playlist) => playlist.id === playlistId)
}

// 라이브러리에 트랙 추가 함수
export const addTrackToLibrary = async (file: File) => {
    const trackId = generateId(file.name)
    const duplicate = await isDuplicateTrack(trackId)

    if (duplicate) {
        alert('이미 동일한 파일이 라이브러리에 존재합니다: ' + file.name)
        return // 중복된 경우 실행하지 않음
    }

    const track: ITrack = {
        id: trackId,
        fileName: file.name,
        playlistIds: [state.vault.currentPlaylistId],
    }

    state.vault.tracks.push({ ...track, url: URL.createObjectURL(file) })

    await db.addTrackToLibrary(track, file)

    state.vault.focusedTrackId = trackId // 새로 추가된 트랙을 포커스
}

// 라이브러리에서 트랙 삭제 함수
export const deleteTrackFromLibrary = async (trackId: string) => {
    state.vault.tracks = state.vault.tracks.filter((track) => track.id !== trackId)
    await db.deleteTrackFromLibrary(trackId)
}

const loadPlaylistsFromDB = async () => {
    const playlists = await db.getAllPlaylists()
    state.vault.playlists = playlists
}

export const addPlaylist = async (newPlaylistName: string) => {
    const playlistId = generateId(newPlaylistName)
    const duplicate = await isDuplicatePlaylist(playlistId)

    if (duplicate) {
        alert('이미 동일한 플레이리스트가 존재합니다: ' + newPlaylistName)
        return // 중복된 경우 실행하지 않음
    }

    const playlist: IPlaylist = {
        id: playlistId,
        name: newPlaylistName,
    }
    state.vault.playlists.push(playlist)
    await db.savePlaylist(playlist)
}

export const deletePlaylist = async (playlistId: string) => {
    state.vault.playlists = state.vault.playlists.filter((playlist) => playlist.id !== playlistId)
    await db.deletePlaylist(playlistId)
}

const unsub = devtools(state, { name: 'state', enabled: true })

// 초기 데이터 로드
loadTracksFromDB()
loadPlaylistsFromDB()
