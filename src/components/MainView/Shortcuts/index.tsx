'use client'

import { EShortcut } from '@/components/MainView/Shortcuts/constants'
import OverlayGuide from '@/components/MainView/Shortcuts/OverlayGuide'
import { deckoSingleton, EDeckIds } from '@ghr95223/decko'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { state } from '@/lib/client/state'
import { Button } from '@/components/ui/button'
import React, { useEffect, useRef, useState } from 'react'
import { KeyboardIcon, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getTracks } from '@/app/main/actions'
import { Track } from '@prisma/client'

const Shortcuts = ({ children }: { children: React.ReactNode }) => {
    const { playlistId: playlistIdParam } = useParams<{ playlistId: string }>()

    const ref = useRef<HTMLDivElement>(null)
    const [showHelp, setShowHelp] = useState(false)

    const tracksQuery = useQuery<Track[]>({
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
                deckoSingleton.setSpeed(EDeckIds.DECK_1, deckoSingleton.getSpeed(EDeckIds.DECK_1) + 0.05),
            [EShortcut.KeyA]: () =>
                deckoSingleton.setSpeed(EDeckIds.DECK_1, deckoSingleton.getSpeed(EDeckIds.DECK_1) - 0.05),
            [EShortcut.BracketRight]: () =>
                deckoSingleton.setSpeed(EDeckIds.DECK_2, deckoSingleton.getSpeed(EDeckIds.DECK_2) + 0.05),
            [EShortcut.Quote]: () =>
                deckoSingleton.setSpeed(EDeckIds.DECK_2, deckoSingleton.getSpeed(EDeckIds.DECK_2) - 0.05),
            [EShortcut.KeyW]: () =>
                deckoSingleton.setVolume(EDeckIds.DECK_1, deckoSingleton.getVolume(EDeckIds.DECK_1) + 0.05),
            [EShortcut.KeyS]: () =>
                deckoSingleton.setVolume(EDeckIds.DECK_1, deckoSingleton.getVolume(EDeckIds.DECK_1) - 0.05),
            [EShortcut.BracketLeft]: () =>
                deckoSingleton.setVolume(EDeckIds.DECK_2, deckoSingleton.getVolume(EDeckIds.DECK_2) + 0.05),
            [EShortcut.Semicolon]: () =>
                deckoSingleton.setVolume(EDeckIds.DECK_2, deckoSingleton.getVolume(EDeckIds.DECK_2) - 0.05),
            [EShortcut.KeyZ]: () => deckoSingleton.setCrossFade(deckoSingleton.getCrossFade() - 0.05),
            [EShortcut.Slash]: () => deckoSingleton.setCrossFade(deckoSingleton.getCrossFade() + 0.05),
            [EShortcut.ShiftLeft]: () => deckoSingleton.playPauseDeck(EDeckIds.DECK_1),
            [EShortcut.ShiftRight]: () => deckoSingleton.playPauseDeck(EDeckIds.DECK_2),
            [EShortcut.Enter]: () => {
                const fileInput = document.getElementById('file-uploader')
                if (fileInput) fileInput.click()
            },
            [EShortcut.ArrowUp]: () => {
                if (state.UI.focusedTrackId) {
                    const index = findIndex(tracksQuery.data, state.UI.focusedTrackId)
                    if (index > 0 && tracksQuery.data) {
                        state.UI.focusedTrackId = tracksQuery.data[index - 1].id
                    } else {
                        const index = findIndex(tracksQuery.data, state.UI.focusedTrackId)
                        if (index > 0 && tracksQuery.data) {
                            state.UI.focusedTrackId = tracksQuery.data[index - 1].id
                        }
                    }
                }
            },
            [EShortcut.ArrowDown]: () => {
                if (state.UI.focusedTrackId && tracksQuery.data) {
                    const index = findIndex(tracksQuery.data, state.UI.focusedTrackId)
                    if (index < tracksQuery.data.length - 1) {
                        state.UI.focusedTrackId = tracksQuery.data[index + 1].id
                    }
                }
            },
            [EShortcut.ArrowLeft]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracksQuery.data) {
                        const index = findIndex(tracksQuery.data, state.UI.focusedTrackId)
                        if (index >= 0) {
                            const url = await getTrackBlobUrl(tracksQuery.data[index].id)
                            deckoSingleton.loadTrack(EDeckIds.DECK_1, url)
                        }
                    }
                }
            },
            [EShortcut.ArrowRight]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracksQuery.data) {
                        const index = findIndex(tracksQuery.data, state.UI.focusedTrackId)
                        if (index <= tracksQuery.data.length - 1) {
                            const url = await getTrackBlobUrl(tracksQuery.data[index].id)
                            deckoSingleton.loadTrack(EDeckIds.DECK_2, url)
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
    }, [tracksQuery.data, getTrackBlobUrl, playlistIdParam])

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
