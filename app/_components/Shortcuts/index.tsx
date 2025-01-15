import { EShortcut } from '@/app/_components/Shortcuts/constants'
import Overlay from '@/app/_components/Shortcuts/Overlay'
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
                // EShortcut에 정의된 값일때만 키보드 막음
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

        const handleKeyDown = (event: KeyboardEvent) => {
            switch (event.code as EShortcut) {
                case EShortcut.KeyQ:
                    audioManager.setVolume(EDeckIds.DECK_1, audioManager.getVolume(EDeckIds.DECK_1) + 0.05)
                    break
                case EShortcut.KeyA:
                    audioManager.setVolume(EDeckIds.DECK_1, audioManager.getVolume(EDeckIds.DECK_1) - 0.05)
                    break
                case EShortcut.BracketRight:
                    audioManager.setVolume(EDeckIds.DECK_2, audioManager.getVolume(EDeckIds.DECK_2) + 0.05)
                    break
                case EShortcut.Quote:
                    audioManager.setVolume(EDeckIds.DECK_2, audioManager.getVolume(EDeckIds.DECK_2) - 0.05)
                    break
                case EShortcut.KeyZ:
                    audioManager.setCrossFade(audioManager.getCrossFade() - 0.05)
                    break
                case EShortcut.Slash:
                    audioManager.setCrossFade(audioManager.getCrossFade() + 0.05)
                    break
                case EShortcut.ShiftLeft:
                    audioManager.playPauseDeck(EDeckIds.DECK_1)
                    break
                case EShortcut.ShiftRight:
                    audioManager.playPauseDeck(EDeckIds.DECK_2)
                    break
                case EShortcut.Enter:
                    const fileInput = document.getElementById('file-uploader')
                    if (fileInput) {
                        fileInput.click()
                    }
                    break
                case EShortcut.ArrowUp:
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index > 0) {
                            store.vault.UI.focusedId = snapshot.vault.library[index - 1].id
                        }
                    }
                    break
                case EShortcut.ArrowDown:
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index < snapshot.vault.library.length - 1) {
                            store.vault.UI.focusedId = snapshot.vault.library[index + 1].id
                        }
                    }
                    break
                case EShortcut.ArrowLeft:
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index >= 0) {
                            audioManager.loadTrack(EDeckIds.DECK_1, snapshot.vault.library[index].url)
                        }
                    }
                    break
                case EShortcut.ArrowRight:
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
            <Overlay visible={showHelp} />
        </div>
    )
}

export default Shortcuts
