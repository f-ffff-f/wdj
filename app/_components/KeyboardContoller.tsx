import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { store } from '@/app/_lib/store'
import { EDeckIds } from '@/app/_lib/types'
import { Button } from '@/components/ui/button'
import React, { useState, useEffect, useRef } from 'react'
import { useSnapshot } from 'valtio'

const preventAllKeyDefaults = (element: HTMLElement): (() => void) => {
    const handler = (event: KeyboardEvent) => {
        event.preventDefault()
        console.log(`Default action prevented for key: ${event.key}`)
    }

    element.addEventListener('keydown', handler)

    return () => {
        element.removeEventListener('keydown', handler)
    }
}

const KeyboardController = ({ children }: { children: React.ReactNode }) => {
    const snapshot = useSnapshot(store)
    const ref = useRef<HTMLDivElement | null>(null)

    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
        if (ref.current) {
            const cleanup = preventAllKeyDefaults(ref.current)
            return () => cleanup()
        }
    }, [ref])

    useEffect(() => {
        const findIndex = (id: string) => {
            return snapshot.vault.library.findIndex((track) => track.id === id)
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.code) {
                case 'KeyQ':
                    audioManager.setVolume(EDeckIds.DECK_1, audioManager.getVolume(EDeckIds.DECK_1) + 0.05)
                    break
                case 'KeyA':
                    audioManager.setVolume(EDeckIds.DECK_1, audioManager.getVolume(EDeckIds.DECK_1) - 0.05)
                    break
                case 'BracketRight':
                    audioManager.setVolume(EDeckIds.DECK_2, audioManager.getVolume(EDeckIds.DECK_2) + 0.05)
                    break
                case 'Quote':
                    audioManager.setVolume(EDeckIds.DECK_2, audioManager.getVolume(EDeckIds.DECK_2) - 0.05)
                    break
                case 'KeyZ':
                    audioManager.setCrossFade(audioManager.getCrossFade() - 0.05)
                    break
                case 'Slash':
                    audioManager.setCrossFade(audioManager.getCrossFade() + 0.05)
                    break
                case 'ShiftLeft':
                    audioManager.playPauseDeck(EDeckIds.DECK_1)
                    break
                case 'ShiftRight':
                    audioManager.playPauseDeck(EDeckIds.DECK_2)
                    break
                case 'Enter':
                    const fileInput = document.getElementById('file-uploader')
                    if (fileInput) {
                        fileInput.click()
                    }
                    break
                case 'ArrowUp':
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index > 0) {
                            store.vault.UI.focusedId = snapshot.vault.library[index - 1].id
                        }
                    }
                    break
                case 'ArrowDown':
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index < snapshot.vault.library.length - 1) {
                            store.vault.UI.focusedId = snapshot.vault.library[index + 1].id
                        }
                    }
                    break
                case 'ArrowLeft':
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index >= 0) {
                            audioManager.loadTrack(EDeckIds.DECK_1, snapshot.vault.library[index].url)
                        }
                    }
                    break
                case 'ArrowRight':
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index <= snapshot.vault.library.length - 1) {
                            audioManager.loadTrack(EDeckIds.DECK_2, snapshot.vault.library[index].url)
                        }
                    }
                    break
                default:
                    break
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
            {showHelp && (
                <div className="help-overlay">
                    <div className="help-content">
                        <h2>Keyboard Controls</h2>
                        <ul>
                            <li>
                                <strong>Volume Controls</strong>
                                <ul>
                                    <li>
                                        <kbd>Q</kbd> / <kbd>A</kbd>: Increase/Decrease Deck 1 volume
                                    </li>
                                    <li>
                                        <kbd>]</kbd> / <kbd>&apos;</kbd>: Increase/Decrease Deck 2 volume
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Playback Controls</strong>
                                <ul>
                                    <li>
                                        <kbd>Left Shift</kbd>: Play/Pause Deck 1
                                    </li>
                                    <li>
                                        <kbd>Right Shift</kbd>: Play/Pause Deck 2
                                    </li>
                                    <li>
                                        <kbd>Z</kbd> / <kbd>/</kbd>: Adjust Cross-fader
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>Navigation</strong>
                                <ul>
                                    <li>
                                        <kbd>↑</kbd> / <kbd>↓</kbd>: Navigate through tracks
                                    </li>
                                    <li>
                                        <kbd>←</kbd>: Load selected track to Deck 1
                                    </li>
                                    <li>
                                        <kbd>→</kbd>: Load selected track to Deck 2
                                    </li>
                                </ul>
                            </li>
                            <li>
                                <strong>File Management</strong>
                                <ul>
                                    <li>
                                        <kbd>Enter</kbd>: Open file upload dialog
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    )
}

export default KeyboardController
