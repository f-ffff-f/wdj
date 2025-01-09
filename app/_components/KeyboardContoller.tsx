import { audioManager } from '@/app/_lib/audioManagerSingleton'
import React, { useState, useEffect } from 'react'

const KeyboardController = () => {
    const [showHelp, setShowHelp] = useState(false)

    useEffect(() => {
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
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)

        return () => {
            window.removeEventListener('keydown', handleKeyDown)
        }
    }, [])

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
