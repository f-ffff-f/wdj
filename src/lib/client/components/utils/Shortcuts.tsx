'use client'

import { getTracks } from '@/app/main/_actions/track'
import { Button } from '@/lib/client/components/ui/button'
import { DECK_IDS } from '@/lib/client/constants'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { state } from '@/lib/client/state'
import { deckoSingleton } from '@ghr95223/decko'
import { useQuery } from '@tanstack/react-query'
import { KeyboardIcon, XIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

enum EShortcut {
    KeyQ = 'KeyQ',
    KeyA = 'KeyA',
    KeyW = 'KeyW',
    KeyS = 'KeyS',
    BracketRight = 'BracketRight',
    Quote = 'Quote',
    BracketLeft = 'BracketLeft',
    Semicolon = 'Semicolon',
    KeyZ = 'KeyZ',
    Slash = 'Slash',
    ShiftLeft = 'ShiftLeft',
    ShiftRight = 'ShiftRight',
    Enter = 'Enter',
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
}

type ShortcutConfig = {
    label: string
    target: string
    position?: 'center' | 'bottom' | 'right'
}

type AllShortcutsCheck = Record<EShortcut, ShortcutConfig>

const UI_SHORTCUTS: AllShortcutsCheck = {
    [EShortcut.KeyQ]: { label: 'Q', target: `#speed-${DECK_IDS.ID_1}` },
    [EShortcut.KeyA]: { label: 'A', target: `#speed-${DECK_IDS.ID_1}`, position: 'bottom' },
    [EShortcut.KeyW]: { label: 'W', target: `#gain-${DECK_IDS.ID_1}` },
    [EShortcut.KeyS]: { label: 'S', target: `#gain-${DECK_IDS.ID_1}`, position: 'bottom' },
    [EShortcut.BracketRight]: { label: ']', target: `#speed-${DECK_IDS.ID_2}` },
    [EShortcut.Quote]: { label: '"', target: `#speed-${DECK_IDS.ID_2}`, position: 'bottom' },
    [EShortcut.BracketLeft]: { label: '[', target: `#gain-${DECK_IDS.ID_2}` },
    [EShortcut.Semicolon]: { label: ';', target: `#gain-${DECK_IDS.ID_2}`, position: 'bottom' },
    [EShortcut.KeyZ]: { label: 'Z', target: `#crossfader` },
    [EShortcut.Slash]: { label: '/', target: `#crossfader`, position: 'right' },
    [EShortcut.ShiftLeft]: { label: 'Shift Left', target: `#play-pause-${DECK_IDS.ID_1}` },
    [EShortcut.ShiftRight]: { label: 'Shift Right', target: `#play-pause-${DECK_IDS.ID_2}`, position: 'right' },
    [EShortcut.Enter]: { label: 'Enter', target: `#file-uploader` },
    [EShortcut.ArrowUp]: { label: '↑', target: `#track-list`, position: 'center' },
    [EShortcut.ArrowDown]: { label: '↓', target: `#track-list`, position: 'bottom' },
    [EShortcut.ArrowLeft]: { label: '←', target: `#track-list` },
    [EShortcut.ArrowRight]: { label: '→', target: `#track-list`, position: 'right' },
}

interface OverlayGuideProps {
    visible: boolean
}

const OverlayGuide: React.FC<OverlayGuideProps> = ({ visible }) => {
    const [positions, setPositions] = useState<Record<string, DOMRect>>({})

    useEffect(() => {
        if (visible) {
            const positionsMap: Record<string, DOMRect> = {}
            Object.entries(UI_SHORTCUTS).forEach(([, { target }]) => {
                const element = document.querySelector(target)
                if (element) {
                    positionsMap[target] = element.getBoundingClientRect()
                }
            })
            setPositions(positionsMap)
        }
    }, [visible])

    if (!visible) return null

    return (
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" style={{ position: 'absolute' }}>
            {Object.entries(UI_SHORTCUTS).map(([code, { label, target, position }]) => {
                const rect = positions[target]
                if (!rect) return null

                let style = {}
                if (position === 'right') {
                    style = {
                        top: rect.top + window.scrollY + rect.height / 2,
                        left: rect.right + window.scrollX,
                        transform: 'translate(-50%, -50%)',
                    }
                } else if (position === 'bottom') {
                    style = {
                        top: rect.bottom + window.scrollY,
                        left: rect.left + window.scrollX + rect.width / 2,
                        transform: 'translate(-50%, -50%)',
                    }
                } else if (position === 'center') {
                    style = {
                        top: rect.top + window.scrollY + rect.height / 2,
                        left: rect.left + window.scrollX + rect.width / 2,
                        transform: 'translate(-50%, -50%)',
                    }
                } else {
                    // 기본값: 왼쪽 상단
                    style = {
                        top: rect.top + window.scrollY + rect.height / 2,
                        left: rect.left + window.scrollX,
                        transform: 'translate(-50%, -50%)',
                    }
                }

                return (
                    <div
                        key={code}
                        className="absolute text-lg font-bold pointer-events-none min-w-5 text-center text-black"
                        style={{
                            ...style,
                            backgroundColor: 'rgba(255, 255, 255, 0.6)', // 어두운 반투명 배경
                            backdropFilter: 'blur(1px)', // 배경 흐림 효과
                        }}
                    >
                        {label}
                    </div>
                )
            })}
        </div>
    )
}

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
                    const index = findIndex(tracks, state.UI.focusedTrackId)
                    if (index > 0 && tracks) {
                        state.UI.focusedTrackId = tracks[index - 1].id
                    } else {
                        const index = findIndex(tracks, state.UI.focusedTrackId)
                        if (index > 0 && tracks) {
                            state.UI.focusedTrackId = tracks[index - 1].id
                        }
                    }
                }
            },
            [EShortcut.ArrowDown]: () => {
                if (state.UI.focusedTrackId && tracks) {
                    const index = findIndex(tracks, state.UI.focusedTrackId)
                    if (index < tracks.length - 1) {
                        state.UI.focusedTrackId = tracks[index + 1].id
                    }
                }
            },
            [EShortcut.ArrowLeft]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracks) {
                        const index = findIndex(tracks, state.UI.focusedTrackId)
                        if (index >= 0) {
                            const url = await getTrackBlobUrl(tracks[index].id)
                            if (url) {
                                deckoSingleton.loadTrack(DECK_IDS.ID_1, url)
                            }
                        }
                    }
                }
            },
            [EShortcut.ArrowRight]: async () => {
                if (state.UI.focusedTrackId) {
                    if (tracks) {
                        const index = findIndex(tracks, state.UI.focusedTrackId)
                        if (index <= tracks.length - 1) {
                            const url = await getTrackBlobUrl(tracks[index].id)
                            if (url) {
                                deckoSingleton.loadTrack(DECK_IDS.ID_2, url)
                            }
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
    }, [tracks, getTrackBlobUrl, playlistIdParam])

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
