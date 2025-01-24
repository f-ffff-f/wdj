import { openDB, DBSchema } from 'idb'
import { IPlaylist, ITrack } from '@/app/_lib/state/types'
import { defaultPlaylistId, defaultPlaylistName } from '@/app/_lib/constants'
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
            playlistId?: string
            fileData: ArrayBuffer
        }
    }
}

// IndexedDB 초기화
const dbPromise = openDB<MyDB>('vault-database', 1, {
    upgrade(db) {
        if (!db.objectStoreNames.contains('playlists')) {
            db.createObjectStore('playlists', { keyPath: 'id' }).add({
                id: defaultPlaylistId,
                name: defaultPlaylistName,
            })
        }
        if (!db.objectStoreNames.contains('tracks')) {
            db.createObjectStore('tracks', { keyPath: 'id' })
        }
    },
})

// IndexedDB 헬퍼 함수들
export const db = {
    async getAllPlaylists(): Promise<IPlaylist[]> {
        const db = await dbPromise
        return await db.getAll('playlists')
    },
    async getPlaylistById(playlistId: string): Promise<IPlaylist | undefined> {
        const db = await dbPromise
        return await db.get('playlists', playlistId)
    },
    async savePlaylist(playlist: IPlaylist): Promise<void> {
        const db = await dbPromise
        await db.put('playlists', playlist)
    },
    async deletePlaylist(playlistId: string): Promise<void> {
        const db = await dbPromise
        await db.delete('playlists', playlistId)
    },
    async getAllTracks(): Promise<ITrack[]> {
        const db = await dbPromise
        const storedTracks = await db.getAll('tracks')
        return storedTracks.map((track) => ({
            id: track.id,
            fileName: track.fileName,
            playlistId: track.playlistId,
            url: URL.createObjectURL(new Blob([track.fileData])), // Blob URL 생성
        }))
    },
    async addTrack(track: ITrack, file: File): Promise<void> {
        const db = await dbPromise
        await db.put('tracks', {
            id: track.id,
            fileName: track.fileName,
            playlistId: track.playlistId,
            fileData: await file.arrayBuffer(), // 파일 데이터를 저장
        })
    },
    async deleteTrack(id: string): Promise<void> {
        const db = await dbPromise
        await db.delete('tracks', id)
    },
}
