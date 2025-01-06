import { store } from '@/app/_lib/store'
import { ITrack, TDeckIds } from '@/app/_lib/types'
import { useSnapshot } from 'valtio'

export const useControl = (audioContext: AudioContext) => {
    const deckStore = store.controller.decks
    const deckSnapshot = useSnapshot(store.controller.decks)

    const loadToDeck =
        (track: ITrack, audioRef: Record<TDeckIds[number], React.RefObject<HTMLAudioElement>>) =>
        (deckId: TDeckIds[number]) => {
            store.controller.decks[deckId].currentTrack = {
                ...track,
            }

            // 오디오 파일 로드
            if (!audioRef[deckId].current || !track.url) return
            audioRef[deckId].current.src = track.url
        }

    // 재생/일시정지 제어
    const togglePlay = async (deckId: TDeckIds[number], audio: React.RefObject<HTMLAudioElement>) => {
        if (!audio.current) return

        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume()
            }

            if (!audio.current.src) return

            if (!deckSnapshot[deckId].isPlaying) {
                const playPromise = audio.current.play()
                await playPromise

                deckStore[deckId].isPlaying = true
            } else {
                audio.current.pause()
                deckStore[deckId].isPlaying = false
            }
        } catch (error) {
            console.error('오디오 재생 에러:', error)
            deckStore[deckId].isPlaying = false
        }
    }

    // 볼륨 제어
    const setVolume = (deckId: TDeckIds[number], vol: number, gain: React.RefObject<GainNode | null>) => {
        deckStore[deckId].volume = vol
        if (gain.current) {
            gain.current.gain.value = vol
        }
    }

    // 크로스페이더 제어
    const setCrossFade = (
        value: number,
        crossFade: {
            a: React.MutableRefObject<GainNode | null>
            b: React.MutableRefObject<GainNode | null>
        },
    ) => {
        store.controller.crossfade.value = value

        if (!crossFade.a.current || !crossFade.b.current) return

        crossFade.a.current.gain.value = Math.cos((value * Math.PI) / 2)
        crossFade.b.current.gain.value = Math.cos(((1 - value) * Math.PI) / 2)
    }

    return {
        loadToDeck,
        togglePlay,
        setVolume,
        setCrossFade,
    }
}
