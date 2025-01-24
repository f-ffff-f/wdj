import { openDB, DBSchema } from 'idb'
import { ITrack } from '@/app/_lib/state/types'
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
            fileData: ArrayBuffer // 파일 데이터를 저장
        }
    }
}

// IndexedDB 초기화
const dbPromise = openDB<MyDB>('track-database', 1, {
    upgrade(db) {
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
            url: URL.createObjectURL(new Blob([track.fileData])), // Blob URL 생성
        }))
    },
    async addTrack(track: ITrack, file: File): Promise<void> {
        const db = await dbPromise
        await db.put('tracks', {
            id: track.id,
            fileName: track.fileName,
            fileData: await file.arrayBuffer(), // 파일 데이터를 저장
        })
    },
    async deleteTrack(id: string): Promise<void> {
        const db = await dbPromise
        await db.delete('tracks', id)
    },
}
