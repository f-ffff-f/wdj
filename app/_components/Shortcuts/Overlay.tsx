import React, { useEffect, useState } from 'react'
import { SHORTCUTS } from '@/app/_components/Shortcuts/constants'

interface OverlayProps {
    visible: boolean
}

const Overlay: React.FC<OverlayProps> = ({ visible }) => {
    const [positions, setPositions] = useState<Record<string, DOMRect>>({})

    useEffect(() => {
        if (visible) {
            const positionsMap: Record<string, DOMRect> = {}
            SHORTCUTS.forEach(({ target }) => {
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
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50" style={{ position: 'fixed' }}>
            {SHORTCUTS.map(({ code, label, target, position }) => {
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

export default Overlay
