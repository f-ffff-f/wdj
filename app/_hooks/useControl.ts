import { store } from '@/app/_lib/store'
import { ITrack, TDeckIds } from '@/app/_lib/types'
import { useContext } from 'react'
import { AudioContextContext } from '@/app/_components/AudioContextProvider'
import { useSnapshot } from 'valtio'

export const useControl = () => {
    const deckStore = store.controller.decks
    const deckSnapshot = useSnapshot(store.controller.decks)
    const audioContext = useContext(AudioContextContext)
    if (!audioContext) {
        throw new Error('useControl must be used within AudioContextProvider')
    }

    const loadToDeck =
        (track: ITrack, audioRef: Record<TDeckIds[number], React.RefObject<HTMLAudioElement>>) =>
        (deckId: TDeckIds[number]) => {
            // store 상태만 업데이트. useToneNodes에서 이 변경을 감지하여 처리
            store.controller.decks[deckId].currentTrack = {
                ...track,
            }
            if (!audioRef[deckId].current || !track.url) return
            audioRef[deckId].current.src = track.url
            console.log(audioRef[deckId].current, 'audio.current')
        }

    // 재생/일시정지 제어
    const togglePlay = async (deckId: TDeckIds[number], audio: React.RefObject<HTMLAudioElement>) => {
        if (!audio.current) {
            console.error('오디오 엘리먼트가 없습니다')
            return
        }
        console.log('현재 오디오 상태:', {
            src: audio.current.src,
            readyState: audio.current.readyState,
            paused: audio.current.paused,
            currentTime: audio.current.currentTime,
            duration: audio.current.duration,
        })

        console.log('AudioContext 상태:', audioContext.state)
        console.log('AudioContext 샘플레이트:', audioContext.sampleRate)

        try {
            if (audioContext.state === 'suspended') {
                await audioContext.resume()
            }

            if (!audio.current.src) {
                console.error('오디오 소스가 설정되지 않았습니다')
                return
            }

            if (!deckSnapshot[deckId].isPlaying) {
                console.log('재생 시도...')
                const playPromise = audio.current.play()
                await playPromise
                console.log('재생 성공')
                deckStore[deckId].isPlaying = true
            } else {
                console.log('일시정지 시도...')
                audio.current.pause()
                console.log('일시정지 성공')
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

    // // 크로스페이더 제어
    // const setCrossFade = (value: number) => {
    //     store.controller.crossfade.value = value
    //     if (nodes.crossFadeNode) {
    //         const gain = deckId === 'A' ? Math.cos(value * 0.5 * Math.PI) : Math.cos((1.0 - value) * 0.5 * Math.PI)
    //         nodes.crossFadeNode.gain.value = gain
    //     }
    // }

    // // 시간 제어
    // const seekTime = (time: number, audioElement: HTMLAudioElement | null) => {
    //     if (!audioElement) return
    //     audioElement.currentTime = time
    // }

    // // EQ 제어 등 다른 컨트롤 함수들도 추가 가능...

    return {
        loadToDeck,
        togglePlay,
        setVolume,
    }
}
