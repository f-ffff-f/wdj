'use client'

import { Button } from '@/lib/client/components/ui/button'
import { Label } from '@/lib/client/components/ui/label'
import { SliderSpeed } from '@/lib/client/components/ui/sliderSpeed'
import { SliderVolume } from '@/lib/client/components/ui/sliderVolume'
import MyLoader from '@/lib/client/components/utils/MyLoader'
import { cn, formatPlaybackTimeUI } from '@/lib/client/utils'
import { DECK_IDS, TDeckId, deckoManager, useDeckoSnapshot } from '@ghr95223/decko'
import React, { useCallback, useMemo } from 'react'

const WaveformVisualizer = React.lazy(() => import('@/app/main/components/DJController/Waveform/WaveformVisualizer'))

// Memoized deck component
const Deck = React.memo(({ deckId }: { deckId: TDeckId }) => {
    return (
        <div className="flex flex-col gap-4 flex-1">
            <div
                className={cn(
                    'max-md:flex-wrap',
                    'flex items-baseline gap-1',
                    deckId === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                )}
            >
                <Volume deckId={deckId} />
                <Speed deckId={deckId} />
                <React.Suspense fallback={<MyLoader />}>
                    <WaveformVisualizer deckId={deckId} />
                </React.Suspense>
            </div>
            <div className={cn('flex items-center gap-4', deckId === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row')}>
                <PlayPause deckId={deckId} />
                <div>
                    <PlayBackTime deckId={deckId} />
                </div>
            </div>
        </div>
    )
})

Deck.displayName = 'Deck'

const Volume = React.memo(({ deckId }: { deckId: TDeckId }) => {
    const snap = useDeckoSnapshot()
    const handleVolumeChange = useCallback((numbers: number[]) => deckoManager.setVolume(deckId, numbers[0]), [deckId])
    return (
        <div className="flex flex-col items-center gap-2">
            <SliderVolume
                id={`volume-${deckId}`}
                min={0}
                max={1}
                step={0.01}
                value={[snap.decks[deckId].volume]}
                onValueChange={handleVolumeChange}
            />
            <Label>Volume</Label>
        </div>
    )
})

Volume.displayName = 'Volume'

const Speed = React.memo(({ deckId }: { deckId: TDeckId }) => {
    const snap = useDeckoSnapshot()
    const handleSpeedChange = useCallback((numbers: number[]) => deckoManager.setSpeed(deckId, numbers[0]), [deckId])
    return (
        <div className="flex flex-col items-center gap-2">
            <SliderSpeed
                id={`speed-${deckId}`}
                min={0.5}
                max={1.5}
                step={0.01}
                value={[snap.decks[deckId].speed]}
                onValueChange={handleSpeedChange}
            />
            <Label>Speed</Label>
        </div>
    )
})

Speed.displayName = 'Speed'

const PlayPause = React.memo(
    // onChange prop의 타입을 명확히 합니다 (이 함수는 DeckControl의 handlePlayPause와 연결됨)
    ({ deckId }: { deckId: TDeckId }) => {
        const snap = useDeckoSnapshot()
        const handlePlayPause = useCallback(() => deckoManager.playPauseDeck(deckId), [deckId])
        return (
            // onClick에서 id를 전달하는 대신, useCallback으로 id가 이미 캡처된 onChange 함수를 사용
            <Button onClick={handlePlayPause} id={`play-pause-${deckId}`} className="min-w-[80px] text-center">
                {snap.decks[deckId].isPlaying ? 'pause' : 'play'}
            </Button>
        )
    },
)

PlayPause.displayName = 'PlayPause'

const PlayBackTime = React.memo(({ deckId }: { deckId: TDeckId }) => {
    // valtio 상태에서 해당 덱의 uiPlaybackTime과 duration만 snapshot으로 가져옵니다.
    // 이렇게 하면 uiPlaybackTime이나 duration이 변경될 때만 이 컴포넌트가 리렌더링됩니다.
    const snap = useDeckoSnapshot()

    const uiPlaybackTime = useMemo(() => {
        if (Number.isFinite(snap.decks[deckId].uiPlaybackTime)) {
            return formatPlaybackTimeUI(snap.decks[deckId].uiPlaybackTime)
        }
        return '∞'
    }, [deckId, snap.decks])

    const uiDuration = useMemo(() => {
        if (Number.isFinite(snap.decks[deckId].duration)) {
            return formatPlaybackTimeUI(snap.decks[deckId].duration)
        }
        return '∞'
    }, [deckId, snap.decks])

    return (
        <Label className="min-w-[10ch] inline-block text-center text-xs">
            {uiPlaybackTime} / {uiDuration}
        </Label>
    )
})

PlayBackTime.displayName = 'PlayBackTime'

export default Deck
