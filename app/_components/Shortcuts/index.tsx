import { EShortcut } from '@/app/_components/Shortcuts/constants'
import OverlayGuide from '@/app/_components/Shortcuts/OverlayGuide'
import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { store } from '@/app/_lib/store'
import { EDeckIds } from '@/app/_lib/types'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'

const Shortcuts = ({ children }: { children: React.ReactNode }) => {
    const snapshot = useSnapshot(store)
    const [showHelp, setShowHelp] = useState(false)

    const ref = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (ref.current) {
            const handler = (event: KeyboardEvent) => {
                // EShortcut에 정의된 값일때만 키보드 기본동작 막음
                if (Object.values(EShortcut).includes(event.code as EShortcut)) {
                    event.preventDefault()
                    console.log(`Default action prevented for key: ${event.key}`)
                }
            }

            const element = ref.current
            element.addEventListener('keydown', handler)
            return () => element.removeEventListener('keydown', handler)
        }
    }, [])

    useEffect(() => {
        const findIndex = (id: string) => {
            return snapshot.vault.library.findIndex((track) => track.id === id)
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
                if (snapshot.vault.UI.focusedId) {
                    const index = findIndex(snapshot.vault.UI.focusedId)
                    if (index > 0) {
                        store.vault.UI.focusedId = snapshot.vault.library[index - 1].id
                    }
                }
            },
            [EShortcut.ArrowDown]: () => {
                if (snapshot.vault.UI.focusedId) {
                    const index = findIndex(snapshot.vault.UI.focusedId)
                    if (index < snapshot.vault.library.length - 1) {
                        store.vault.UI.focusedId = snapshot.vault.library[index + 1].id
                    }
                }
            },
            [EShortcut.ArrowLeft]: () => {
                if (snapshot.vault.UI.focusedId) {
                    const index = findIndex(snapshot.vault.UI.focusedId)
                    if (index >= 0) {
                        audioManager.loadTrack(EDeckIds.DECK_1, snapshot.vault.library[index].url)
                    }
                }
            },
            [EShortcut.ArrowRight]: () => {
                if (snapshot.vault.UI.focusedId) {
                    const index = findIndex(snapshot.vault.UI.focusedId)
                    if (index <= snapshot.vault.library.length - 1) {
                        audioManager.loadTrack(EDeckIds.DECK_2, snapshot.vault.library[index].url)
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

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [snapshot])

    return (
        <div className="app-container" ref={ref}>
            {children}
            {showHelp ? (
                <Button onClick={() => setShowHelp(false)}>Hide Key Guide</Button>
            ) : (
                <Button onClick={() => setShowHelp(true)}>Show Key Guide</Button>
            )}
            <OverlayGuide visible={showHelp} />
        </div>
    )
}

export default Shortcuts
