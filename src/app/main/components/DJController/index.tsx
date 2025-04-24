'use client'

import WaveformVisualizer from '@/app/main/components/DJController/Waveform/WaveformVisualizer'
import { Button } from '@/lib/client/components/ui/button'
import { Label } from '@/lib/client/components/ui/label'
import { SliderCrossfade } from '@/lib/client/components/ui/sliderCrossfade'
import { SliderSpeed } from '@/lib/client/components/ui/sliderSpeed'
import { SliderVolume } from '@/lib/client/components/ui/sliderVolume'
import { cn, formatPlaybackTimeUI } from '@/lib/client/utils'
import { DECK_IDS, TDeckId, deckoManager, useDeckoSnapshot } from '@ghr95223/decko'
import React, { useCallback } from 'react'

// Memoized deck component
const DeckControl = React.memo(({ id }: { id: TDeckId }) => {
    return (
        <div className="flex flex-col gap-4 flex-1">
            <div
                className={cn(
                    'max-md:flex-wrap',
                    'flex items-baseline gap-1',
                    id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row',
                )}
            >
                <Volume id={id} />
                <Speed id={id} />
                <WaveformVisualizer deckId={id} />
            </div>
            <div className={cn('flex items-center gap-4', id === DECK_IDS.ID_1 ? 'flex-row-reverse' : 'flex-row')}>
                <PlayPause id={id} />
                <div>
                    <PlayBackTime deckId={id} />
                </div>
            </div>
        </div>
    )
})

DeckControl.displayName = 'DeckControl'

const Volume = React.memo(({ id }: { id: TDeckId }) => {
    const { volume } = useDeckoSnapshot(['decks', id])
    const handleVolumeChange = useCallback((numbers: number[]) => deckoManager.setVolume(id, numbers[0]), [id])
    return (
        <div className="flex flex-col items-center gap-2">
            <SliderVolume
                id={`volume-${id}`}
                min={0}
                max={1}
                step={0.01}
                value={[volume]}
                onValueChange={handleVolumeChange}
            />
            <Label>Volume</Label>
        </div>
    )
})

Volume.displayName = 'Volume'

const Speed = React.memo(({ id }: { id: TDeckId }) => {
    const { speed } = useDeckoSnapshot(['decks', id])
    const handleSpeedChange = useCallback((numbers: number[]) => deckoManager.setSpeed(id, numbers[0]), [id])
    return (
        <div className="flex flex-col items-center gap-2">
            <SliderSpeed
                id={`speed-${id}`}
                min={0.5}
                max={1.5}
                step={0.01}
                value={[speed]}
                onValueChange={handleSpeedChange}
            />
            <Label>Speed</Label>
        </div>
    )
})

Speed.displayName = 'Speed'

const PlayPause = React.memo(
    // onChange prop의 타입을 명확히 합니다 (이 함수는 DeckControl의 handlePlayPause와 연결됨)
    ({ id }: { id: TDeckId }) => {
        const { isPlaying } = useDeckoSnapshot(['decks', id])
        const handlePlayPause = useCallback(() => deckoManager.playPauseDeck(id), [id])
        return (
            // onClick에서 id를 전달하는 대신, useCallback으로 id가 이미 캡처된 onChange 함수를 사용
            <Button onClick={handlePlayPause} id={`play-pause-${id}`} className="min-w-[80px] text-center">
                {isPlaying ? 'pause' : 'play'}
            </Button>
        )
    },
)

PlayPause.displayName = 'PlayPause'

const PlayBackTime = React.memo(({ deckId }: { deckId: TDeckId }) => {
    // valtio 상태에서 해당 덱의 uiPlaybackTime과 duration만 snapshot으로 가져옵니다.
    // 이렇게 하면 uiPlaybackTime이나 duration이 변경될 때만 이 컴포넌트가 리렌더링됩니다.
    const { uiPlaybackTime, duration } = useDeckoSnapshot(['decks', deckId])

    return (
        <Label className="min-w-[10ch] inline-block text-center text-xs">
            {formatPlaybackTimeUI(uiPlaybackTime)} / -
            {Number.isFinite(duration) ? formatPlaybackTimeUI(uiPlaybackTime - duration) : '∞'}
        </Label>
    )
})

PlayBackTime.displayName = 'PlayBackTime'

const Crossfader = React.memo(() => {
    const crossFade = useDeckoSnapshot(['crossFade'])
    const onChange = useCallback((numbers: number[]) => deckoManager.setCrossFade(numbers[0]), [])
    return (
        <div className="w-1/2 self-center flex flex-col gap-2">
            <SliderCrossfade id="crossfader" min={0} max={1} step={0.01} value={[crossFade]} onValueChange={onChange} />
            <Label className="self-center">Crossfader</Label>
        </div>
    )
})

Crossfader.displayName = 'Crossfader'

const DJController = ({ children: TrackListComponent }: { children: React.ReactNode }) => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex gap-4">
                {Object.values(DECK_IDS).map((deckId) => (
                    // DeckControl에는 id만 전달
                    <DeckControl key={deckId} id={deckId} />
                ))}
            </div>
            <Crossfader />
            <div className="flex flex-col items-center self-center gap-4">{TrackListComponent}</div>
            {/* bad practice */}
            {/* <div key="test" className="flex flex-col items-center self-center gap-4">
                <FileUploader />
                {TrackListComponent}
            </div> */}
        </div>
    )
}

export default DJController
