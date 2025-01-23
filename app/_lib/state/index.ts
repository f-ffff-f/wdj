import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'
import { db } from './db'
import { ITrack } from '@/app/_lib/state/types'
import { generateTrackId } from '@/app/_lib/state/utils'
interface IState {
    vault: {
        UI: {
            focusedId: string
        }
        library: ITrack[]
    }
}

export const state = proxy<IState>({
    vault: {
        UI: { focusedId: '' },
        library: [],
    },
})

export const loadTracksFromDB = async () => {
    const tracks = await db.getAllTracks()
    state.vault.library = tracks
}

// IndexedDB와 상태에서 ID 중복 확인
export const isDuplicateTrack = async (trackId: string): Promise<boolean> => {
    // 상태에서 중복 확인
    if (state.vault.library.some((track) => track.id === trackId)) {
        return true
    }

    // IndexedDB에서 중복 확인
    const allTracks = await db.getAllTracks()
    return allTracks.some((track) => track.id === trackId)
}

// 트랙 추가 함수
export const addTrackToLibrary = async (file: File) => {
    const trackId = generateTrackId(file.name)
    const duplicate = await isDuplicateTrack(trackId)

    if (duplicate) {
        console.log('이미 동일한 파일이 라이브러리에 존재합니다:', file.name)
        return // 중복된 경우 실행하지 않음
    }

    const track: ITrack = {
        id: trackId,
        fileName: file.name,
        duration: 0,
        url: URL.createObjectURL(file), // Blob URL 생성
    }

    state.vault.library.push(track) // 상태 업데이트
    await db.addTrack(track, file) // IndexedDB에 저장

    state.vault.UI.focusedId = trackId // 새로 추가된 트랙을 포커스
}

const unsub = devtools(state, { name: 'state', enabled: true })

// 초기 데이터 로드
loadTracksFromDB()
