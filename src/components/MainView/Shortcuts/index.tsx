'use client'

import { getTracks } from '@/app/main/_actions/track'
import { EShortcut } from '@/components/MainView/Shortcuts/constants'
import OverlayGuide from '@/components/MainView/Shortcuts/OverlayGuide'
import { Button } from '@/components/ui/button'
import { DECK_IDS } from '@/lib/client/constants/deck'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { state } from '@/lib/client/state'
import { deckoSingleton } from '@ghr95223/decko'
import { useQuery } from '@tanstack/react-query'
import { KeyboardIcon, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

const Shortcuts = ({ children }: { children: React.ReactNode }) => {
    const { playlistId: playlistIdParam } = useParams<{ playlistId: string }>()
    const ref = useRef<HTMLDivElement>(null)
    const [showHelp, setShowHelp] = useState(false)

    const { data: tracks } = useQuery({
        queryKey: ['tracks', playlistIdParam],
        queryFn: () => getTracks(playlistIdParam),
    })

    const { getTrackBlobUrl } = useTrackBlob()
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
                deckoSingleton.setSpeed(DECK_IDS.ID_1, deckoSingleton.getSpeed(DECK_IDS.ID_1) + 0.05),
            [EShortcut.KeyA]: () =>
                deckoSingleton.setSpeed(DECK_IDS.ID_1, deckoSingleton.getSpeed(DECK_IDS.ID_1) - 0.05),
            [EShortcut.BracketRight]: () =>
                deckoSingleton.setSpeed(DECK_IDS.ID_2, deckoSingleton.getSpeed(DECK_IDS.ID_2) + 0.05),
            [EShortcut.Quote]: () =>
                deckoSingleton.setSpeed(DECK_IDS.ID_2, deckoSingleton.getSpeed(DECK_IDS.ID_2) - 0.05),
            [EShortcut.KeyW]: () =>
                deckoSingleton.setVolume(DECK_IDS.ID_1, deckoSingleton.getVolume(DECK_IDS.ID_1) + 0.05),
            [EShortcut.KeyS]: () =>
                deckoSingleton.setVolume(DECK_IDS.ID_1, deckoSingleton.getVolume(DECK_IDS.ID_1) - 0.05),
            [EShortcut.BracketLeft]: () =>
                deckoSingleton.setVolume(DECK_IDS.ID_2, deckoSingleton.getVolume(DECK_IDS.ID_2) + 0.05),
            [EShortcut.Semicolon]: () =>
                deckoSingleton.setVolume(DECK_IDS.ID_2, deckoSingleton.getVolume(DECK_IDS.ID_2) - 0.05),
            [EShortcut.KeyZ]: () => deckoSingleton.setCrossFade(deckoSingleton.getCrossFade() - 0.05),
            [EShortcut.Slash]: () => deckoSingleton.setCrossFade(deckoSingleton.getCrossFade() + 0.05),
            [EShortcut.ShiftLeft]: () => deckoSingleton.playPauseDeck(DECK_IDS.ID_1),
            [EShortcut.ShiftRight]: () => deckoSingleton.playPauseDeck(DECK_IDS.ID_2),
            [EShortcut.Enter]: () => {
                const fileInput = document.getElementById('file-uploader')
                if (fileInput) fileInput.click()
            },
            [EShortcut.ArrowUp]: () => {
                if (state.UI.focusedTrackId) {
                    const index = findIndex(tracks?.data, state.UI.focusedTrackId)
                    if (index > 0 && tracks?.data) {
                        state.UI.focusedTrackId = tracks?.data[index - 1].id
                    } else {
                        const index = findIndex(tracks?.data, state.UI.focusedTrackId)
                        if (index > 0 && tracks?.data) {
                            state.UI.focusedTrackId = tracks?.data[index - 1].id
                        }
                    }
                }
            },
            [EShortcut.ArrowDown]: () => {
                if (state.UI.focusedTrackId && tracks?.data) {
                    const index = findIndex(tracks?.data, state.UI.focusedTrackId)
                    if (index < tracks?.data.length - 1) {
                        state.UI.focusedTrackId = tracks?.data[index + 1].id
                    }
                }
            },
            [EShortcut.ArrowLeft]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracks?.data) {
                        const index = findIndex(tracks?.data, state.UI.focusedTrackId)
                        if (index >= 0) {
                            const url = await getTrackBlobUrl(tracks?.data[index].id)
                            deckoSingleton.loadTrack(DECK_IDS.ID_1, url)
                        }
                    }
                }
            },
            [EShortcut.ArrowRight]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracks?.data) {
                        const index = findIndex(tracks?.data, state.UI.focusedTrackId)
                        if (index <= tracks?.data.length - 1) {
                            const url = await getTrackBlobUrl(tracks?.data[index].id)
                            deckoSingleton.loadTrack(DECK_IDS.ID_2, url)
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
    }, [tracks?.data, getTrackBlobUrl, playlistIdParam])

    return (
        <div
            ref={ref}
            tabIndex={-1} // 포커스 가능하도록 tabIndex 추가
            className="outline-none" // 포커스 아웃라인 제거
            onClick={() => ref.current?.focus()} // 클릭 시 포커스 확보
        >
            {children}
            {showHelp ? (
                <Button className="fixed bottom-4 right-4 z-50" onClick={() => setShowHelp(false)}>
                    <XIcon />
                </Button>
            ) : (
                <Button className="fixed bottom-4 right-4 z-50" onClick={() => setShowHelp(true)}>
                    <KeyboardIcon />
                </Button>
            )}
            <OverlayGuide visible={showHelp} />
        </div>
    )
}

export default Shortcuts
