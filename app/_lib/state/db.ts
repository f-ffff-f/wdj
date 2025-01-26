import { openDB, DBSchema } from 'idb'
import { IPlaylist, ITrack } from '@/app/_lib/state/types'
// IndexedDB 스키마 정의
interface MyDB extends DBSchema {
    playlists: {
        key: string
        value: {
            id: string
            name: string
        }
    }
    tracks: {
        key: string
        value: {
            id: string
            fileName: string
            playlistIds: string[]
            fileData: ArrayBuffer
        }
    }
}

// IndexedDB 초기화
const dbPromise = openDB<MyDB>('vault-database', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('playlists')) {
            db.createObjectStore('playlists', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('tracks')) {
            db.createObjectStore('tracks', { keyPath: 'id' })
        }
    },
})

// IndexedDB 헬퍼 함수들
export const db = {
    async getAllTracks(): Promise<ITrack[]> {
        const db = await dbPromise
        const storedTracks = await db.getAll('tracks')
        return storedTracks.map((track) => ({
            id: track.id,
            fileName: track.fileName,
            playlistIds: track.playlistIds,
            url: URL.createObjectURL(new Blob([track.fileData])), // Blob URL 생성
        }))
    },
    async getAllPlaylists(): Promise<IPlaylist[]> {
        const db = await dbPromise
        return await db.getAll('playlists')
    },
    async addTrackToLibrary(track: ITrack, file: File): Promise<void> {
        const db = await dbPromise
        await db.put('tracks', {
            id: track.id,
            fileName: track.fileName,
            playlistIds: track.playlistIds,
            fileData: await file.arrayBuffer(), // 파일 데이터를 저장
        })
    },
    async deleteTrackFromLibrary(id: string): Promise<void> {
        const db = await dbPromise
        await db.delete('tracks', id)
    },
    async savePlaylist(playlist: IPlaylist): Promise<void> {
        const db = await dbPromise
        await db.put('playlists', playlist)
    },
    async updatePlaylistName(prevPlaylistId: string, newPlaylistId: string, newName: string): Promise<void> {
        const db = await dbPromise
        await db.delete('playlists', prevPlaylistId)
        await db.put('playlists', { id: newPlaylistId, name: newName })
        const tracks = await db.getAll('tracks')
        tracks.forEach((track) => {
            if (track.playlistIds.includes(prevPlaylistId)) {
                track.playlistIds = track.playlistIds.filter((id) => id !== prevPlaylistId).concat(newPlaylistId)
                db.put('tracks', track)
            }
        })
    },
    async deletePlaylist(playlistId: string): Promise<void> {
        const db = await dbPromise
        await db.delete('playlists', playlistId)
        const tracks = await db.getAll('tracks')
        tracks.forEach((track) => {
            track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
            db.put('tracks', track)
        })
    },
    async addTrackToPlaylist(trackId: string, playlistId: string): Promise<void> {
        const db = await dbPromise
        const track = await db.get('tracks', trackId)
        if (track) {
            track.playlistIds.push(playlistId)
            await db.put('tracks', track)
        }
    },
    async deleteTrackFromPlaylist(trackId: string, playlistId: string): Promise<void> {
        const db = await dbPromise
        const track = await db.get('tracks', trackId)
        if (track) {
            track.playlistIds = track.playlistIds.filter((id) => id !== playlistId)
            await db.put('tracks', track)
        }
    },
}
