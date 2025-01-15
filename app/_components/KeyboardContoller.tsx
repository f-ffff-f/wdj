import { audioManager } from '@/app/_lib/audioManagerSingleton'
import { store } from '@/app/_lib/store'
import React, { useState, useEffect } from 'react'
import { useSnapshot } from 'valtio'

const KeyboardController = () => {
    const snapshot = useSnapshot(store)
    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
        const findIndex = (id: string) => {
            return snapshot.vault.library.findIndex((track) => track.id === id)
        }
        const handleKeyDown = (event: KeyboardEvent) => {
            console.log(event.code)
            switch (event.code) {
                case 'KeyQ':
                    audioManager.setVolume(1, audioManager.getVolume(1) + 0.05)
                    break
                case 'KeyA':
                    audioManager.setVolume(1, audioManager.getVolume(1) - 0.05)
                    break
                case 'BracketRight':
                    audioManager.setVolume(2, audioManager.getVolume(2) + 0.05)
                    break
                case 'Quote':
                    audioManager.setVolume(2, audioManager.getVolume(2) - 0.05)
                    break
                case 'ShiftLeft':
                    audioManager.playPauseDeck(1)
                    break
                case 'ShiftRight':
                    audioManager.playPauseDeck(2)
                    break
                case 'KeyZ':
                    audioManager.setCrossFade(audioManager.getCrossFade() - 0.05)
                    break
                case 'Slash':
                    audioManager.setCrossFade(audioManager.getCrossFade() + 0.05)
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
                            audioManager.loadTrack(1, snapshot.vault.library[index].url)
                        }
                    }
                    break
                case 'ArrowRight':
                    if (snapshot.vault.UI.focusedId) {
                        const index = findIndex(snapshot.vault.UI.focusedId)
                        if (index <= snapshot.vault.library.length - 1) {
                            audioManager.loadTrack(2, snapshot.vault.library[index].url)
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
        <div className="app-container">
            {showHelp && (
                <div className="help-overlay">
                    <div className="help-content">
                        <h2>도움말</h2>
                        <ul>
                            <li>
                                <strong>↑</strong>: 위로 이동
                            </li>
                            <li>
                                <strong>↓</strong>: 아래로 이동
                            </li>
                            <li>
                                <strong>←</strong>: 왼쪽으로 이동
                            </li>
                            <li>
                                <strong>→</strong>: 오른쪽으로 이동
                            </li>
                            <li>
                                <strong>h</strong>: 도움말 토글
                            </li>
                        </ul>
                        <button onClick={() => setShowHelp(false)}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    )
}

export default KeyboardController
