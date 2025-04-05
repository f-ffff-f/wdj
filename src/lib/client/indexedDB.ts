import { updateStorageEstimate } from '@/lib/client/state'
import { openDB, DBSchema } from 'idb'

interface TracksDB extends DBSchema {
    tracks: {
        key: string // 트랙 id를 key로 사용
        value: Blob // 저장할 트랙의 blob 데이터
    }
}

const DB_NAME = 'TracksDB'
const STORE_NAME = 'tracks'

const initIndexedDB = async () => {
    return await openDB<TracksDB>(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME)
            }
        },
    })
}

export const getTrackFromIndexedDB = async (id: string): Promise<Blob | undefined> => {
    const db = await initIndexedDB()
    return db.get(STORE_NAME, id)
}

export const setTrackToIndexedDB = async (id: string, blob: Blob) => {
    const db = await initIndexedDB()
    await db.put(STORE_NAME, blob, id)
    await updateStorageEstimate()
}

export const deleteTrackFromIndexedDB = async (id: string) => {
    const db = await initIndexedDB()
    await db.delete(STORE_NAME, id)
    await updateStorageEstimate()
}

export const clearAllTracksFromIndexedDB = async () => {
    const db = await initIndexedDB()
    await db.clear(STORE_NAME)
    await updateStorageEstimate()
}
