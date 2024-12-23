import { TDeckIds } from '@/app/_lib/constants'
import { proxy } from 'valtio'
import { devtools } from 'valtio/utils'

interface ITrackInfo {
    id: string
    title: string
    artist: string
    duration: number
}

interface IDeck {
    currentTrack: ITrackInfo | null
    playPosition: number
    volume: number
    isPlaying: boolean
    // 필요에 따라 추가 필드 작성
}

export const controlState = proxy({
    decks: {
        a: {
            currentTrack: null,
            playPosition: 0,
            volume: 1,
            isPlaying: false,
        } as IDeck,
        b: {
            currentTrack: null,
            playPosition: 0,
            volume: 1,
            isPlaying: false,
        },
    } as { [key: TDeckIds[number]]: IDeck },
    crossfadeValue: 0.5,
})

const unsub = devtools(controlState, { name: 'control state', enabled: true })
