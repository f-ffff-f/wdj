import { EShortcut } from '@/components/Shortcuts/constants'
import OverlayGuide from '@/components/Shortcuts/OverlayGuide'
import { audioManager } from '@/lib/client/audioManager/audioManagerSingleton'
import { EDeckIds } from '@/lib/client/constants'
import { usePlaylist } from '@/lib/client/hooks/usePlaylist'
import { useTrack } from '@/lib/client/hooks/useTrack'
import { state } from '@/lib/client/state'
import { Button } from '@/components/ui/button'
import React, { useEffect, useRef, useState } from 'react'

const Shortcuts = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null)
    const [showHelp, setShowHelp] = useState(false)
    const { tracksQuery, getTrackBlobUrl } = useTrack()
    const { playlistTracksQuery } = usePlaylist()

    useEffect(() => {
        ref.current?.focus()
    }, [])

    useEffect(() => {
        const element = ref.current
        const handler = (event: KeyboardEvent) => {
            // EShortcut에 정의된 값일때만 키보드 기본동작 막음
            if (Object.values(EShortcut).includes(event.code as EShortcut)) {
                event.preventDefault()
                console.log(`Default action prevented for key: ${event.key}`)
            }
        }

        element?.addEventListener('keydown', handler)
        return () => element?.removeEventListener('keydown', handler)
    }, [])

    useEffect(() => {
        const element = ref.current

        const findIndex = (tracks: ReadonlyArray<{ readonly id: string }> | undefined, id: string) => {
            return tracks?.findIndex((track) => track.id === id) ?? -1
        }

        const shortcutHandlers: Record<EShortcut, () => void> = {
            [EShortcut.KeyQ]: () =>
                audioManager.setSpeed(EDeckIds.DECK_1, audioManager.getSpeed(EDeckIds.DECK_1) + 0.05),
            [EShortcut.KeyA]: () =>
                audioManager.setSpeed(EDeckIds.DECK_1, audioManager.getSpeed(EDeckIds.DECK_1) - 0.05),
            [EShortcut.BracketRight]: () =>
                audioManager.setSpeed(EDeckIds.DECK_2, audioManager.getSpeed(EDeckIds.DECK_2) + 0.05),
            [EShortcut.Quote]: () =>
                audioManager.setSpeed(EDeckIds.DECK_2, audioManager.getSpeed(EDeckIds.DECK_2) - 0.05),
            [EShortcut.KeyW]: () =>
                audioManager.setVolume(EDeckIds.DECK_1, audioManager.getVolume(EDeckIds.DECK_1) + 0.05),
            [EShortcut.KeyS]: () =>
                audioManager.setVolume(EDeckIds.DECK_1, audioManager.getVolume(EDeckIds.DECK_1) - 0.05),
            [EShortcut.BracketLeft]: () =>
                audioManager.setVolume(EDeckIds.DECK_2, audioManager.getVolume(EDeckIds.DECK_2) + 0.05),
            [EShortcut.Semicolon]: () =>
                audioManager.setVolume(EDeckIds.DECK_2, audioManager.getVolume(EDeckIds.DECK_2) - 0.05),
            [EShortcut.KeyZ]: () => audioManager.setCrossFade(audioManager.getCrossFade() - 0.05),
            [EShortcut.Slash]: () => audioManager.setCrossFade(audioManager.getCrossFade() + 0.05),
            [EShortcut.ShiftLeft]: () => audioManager.playPauseDeck(EDeckIds.DECK_1),
            [EShortcut.ShiftRight]: () => audioManager.playPauseDeck(EDeckIds.DECK_2),
            [EShortcut.Enter]: () => {
                const fileInput = document.getElementById('file-uploader')
                if (fileInput) fileInput.click()
            },
            [EShortcut.ArrowUp]: () => {
                if (state.UI.focusedTrackId) {
                    if (state.UI.currentPlaylistId === '') {
                        const index = findIndex(tracksQuery, state.UI.focusedTrackId)
                        if (index > 0 && tracksQuery) {
                            state.UI.focusedTrackId = tracksQuery[index - 1].id
                        }
                    } else {
                        const index = findIndex(playlistTracksQuery, state.UI.focusedTrackId)
                        if (index > 0 && playlistTracksQuery) {
                            state.UI.focusedTrackId = playlistTracksQuery[index - 1].id
                        }
                    }
                }
            },
            [EShortcut.ArrowDown]: () => {
                if (state.UI.focusedTrackId) {
                    if (state.UI.currentPlaylistId === '' && tracksQuery) {
                        const index = findIndex(tracksQuery, state.UI.focusedTrackId)
                        if (index < tracksQuery.length - 1) {
                            state.UI.focusedTrackId = tracksQuery[index + 1].id
                        }
                    } else if (state.UI.currentPlaylistId && playlistTracksQuery) {
                        const index = findIndex(playlistTracksQuery, state.UI.focusedTrackId)
                        if (index < playlistTracksQuery.length - 1) {
                            state.UI.focusedTrackId = playlistTracksQuery[index + 1].id
                        }
                    }
                }
            },
            [EShortcut.ArrowLeft]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracksQuery) {
                        const index = findIndex(tracksQuery, state.UI.focusedTrackId)
                        if (index >= 0) {
                            const url = await getTrackBlobUrl(tracksQuery[index].id)
                            audioManager.loadTrack(EDeckIds.DECK_1, url)
                        }
                    }
                }
            },
            [EShortcut.ArrowRight]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracksQuery) {
                        const index = findIndex(tracksQuery, state.UI.focusedTrackId)
                        if (index <= tracksQuery.length - 1) {
                            const url = await getTrackBlobUrl(tracksQuery[index].id)
                            audioManager.loadTrack(EDeckIds.DECK_2, url)
                        }
                    }
                }
            },
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            const handler = shortcutHandlers[event.code as EShortcut]
            if (handler) {
                handler()
            }
        }

        element?.addEventListener('keydown', handleKeyDown)

        return () => {
            element?.removeEventListener('keydown', handleKeyDown)
        }
    }, [tracksQuery, playlistTracksQuery, getTrackBlobUrl])

    return (
        <div
            ref={ref}
            tabIndex={-1} // 포커스 가능하도록 tabIndex 추가
            className="outline-none" // 포커스 아웃라인 제거
            onClick={() => ref.current?.focus()} // 클릭 시 포커스 확보
        >
            {children}
            {showHelp ? (
                <Button className="fixed bottom-4 left-4 z-50" onClick={() => setShowHelp(false)}>
                    Hide Key Guide
                </Button>
            ) : (
                <Button className="fixed bottom-4 left-4 z-50" onClick={() => setShowHelp(true)}>
                    Show Key Guide
                </Button>
            )}
            <OverlayGuide visible={showHelp} />
        </div>
    )
}

export default Shortcuts
