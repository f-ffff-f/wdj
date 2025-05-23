'use client'

import { fetchTracks } from '@/app/main/_fetchers/tracks'
import { Button } from '@/lib/client/components/ui/button'
import { useTrackBlob } from '@/lib/client/hooks/useTrackBlob'
import { uiState } from '@/lib/client/state'
import { DECK_IDS, deckoManager, useDeckoSnapshot } from '@ghr95223/decko'
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
    const { playlistId } = useParams()

    const speed1 = useDeckoSnapshot().decks[1].speed
    const speed2 = useDeckoSnapshot().decks[2].speed
    const volume1 = useDeckoSnapshot().decks[1].volume
    const volume2 = useDeckoSnapshot().decks[2].volume
    const crossFade = useDeckoSnapshot().crossFade

    const ref = useRef<HTMLDivElement>(null)
    const [showHelp, setShowHelp] = useState(false)

    const tracks = useQuery({
        queryKey: ['tracks', playlistId],
        queryFn: () => fetchTracks(playlistId as string),
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
            [EShortcut.KeyQ]: () => deckoManager.setSpeed(DECK_IDS.ID_1, speed1 + 0.05),
            [EShortcut.KeyA]: () => deckoManager.setSpeed(DECK_IDS.ID_1, speed1 - 0.05),
            [EShortcut.BracketRight]: () => deckoManager.setSpeed(DECK_IDS.ID_2, speed2 + 0.05),
            [EShortcut.Quote]: () => deckoManager.setSpeed(DECK_IDS.ID_2, speed2 - 0.05),
            [EShortcut.KeyW]: () => deckoManager.setVolume(DECK_IDS.ID_1, volume1 + 0.05),
            [EShortcut.KeyS]: () => deckoManager.setVolume(DECK_IDS.ID_1, volume1 - 0.05),
            [EShortcut.BracketLeft]: () => deckoManager.setVolume(DECK_IDS.ID_2, volume2 + 0.05),
            [EShortcut.Semicolon]: () => deckoManager.setVolume(DECK_IDS.ID_2, volume2 - 0.05),
            [EShortcut.KeyZ]: () => deckoManager.setCrossFade(crossFade - 0.05),
            [EShortcut.Slash]: () => deckoManager.setCrossFade(crossFade + 0.05),
            [EShortcut.ShiftLeft]: () => deckoManager.playPauseDeck(DECK_IDS.ID_1),
            [EShortcut.ShiftRight]: () => deckoManager.playPauseDeck(DECK_IDS.ID_2),
            [EShortcut.Enter]: () => {
                const fileInput = document.getElementById('file-uploader')
                if (fileInput) fileInput.click()
            },
            [EShortcut.ArrowUp]: () => {
                if (uiState.focusedTrackId) {
                    const index = findIndex(tracks.data, uiState.focusedTrackId)
                    if (index > 0 && tracks.data) {
                        uiState.focusedTrackId = tracks.data[index - 1].id
                    } else {
                        const index = findIndex(tracks.data, uiState.focusedTrackId)
                        if (index > 0 && tracks.data) {
                            uiState.focusedTrackId = tracks.data[index - 1].id
                        }
                    }
                }
            },
            [EShortcut.ArrowDown]: () => {
                if (uiState.focusedTrackId && tracks) {
                    const index = findIndex(tracks.data, uiState.focusedTrackId)
                    if (index < (tracks.data?.length ?? 0) - 1) {
                        uiState.focusedTrackId = tracks.data?.[index + 1].id ?? ''
                    }
                }
            },
            [EShortcut.ArrowLeft]: async () => {
                if (uiState.focusedTrackId) {
                    if (tracks) {
                        const index = findIndex(tracks.data, uiState.focusedTrackId)
                        if (index >= 0) {
                            const url = await getTrackBlobUrl(tracks.data?.[index].id ?? '')
                            if (url) {
                                deckoManager.loadTrack(DECK_IDS.ID_1, url)
                            }
                        }
                    }
                }
            },
            [EShortcut.ArrowRight]: async () => {
                if (uiState.focusedTrackId) {
                    if (tracks) {
                        const index = findIndex(tracks.data ?? [], uiState.focusedTrackId)
                        if (index <= (tracks.data?.length ?? 0) - 1) {
                            const url = await getTrackBlobUrl(tracks.data?.[index].id ?? '')
                            if (url) {
                                deckoManager.loadTrack(DECK_IDS.ID_2, url)
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [crossFade, getTrackBlobUrl, speed1, speed2, volume1, volume2])

    return (
        <div
            ref={ref}
            tabIndex={-1} // 포커스 가능하도록 tabIndex 추가
            className="outline-none" // 포커스 아웃라인 제거
            onClick={() => ref.current?.focus()} // 클릭 시 포커스 확보
        >
            {children}
            {showHelp ? (
                <Button className="fixed bottom-4 right-0 z-50" onClick={() => setShowHelp(false)}>
                    <XIcon />
                </Button>
            ) : (
                <Button className="fixed bottom-4 right-0 z-50" onClick={() => setShowHelp(true)}>
                    <KeyboardIcon />
                </Button>
            )}
            <OverlayGuide visible={showHelp} />
        </div>
    )
}

Shortcuts.displayName = 'Shortcuts'

export default React.memo(Shortcuts)
