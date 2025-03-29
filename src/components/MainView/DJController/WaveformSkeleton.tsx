'use client'

import React, { useEffect, useRef } from 'react'

const WaveformSkeleton = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        canvas.width = canvas.parentElement?.offsetWidth ?? 0
        canvas.height = canvas.parentElement?.offsetHeight ?? 0

        const bars = Array.from({ length: canvas.width / 1 }, () => Math.random() * canvas.height)

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            bars.forEach((bar, i) => {
                const height = Math.sin(Date.now() * 0.005 + i) * (canvas.height / 2) + canvas.height / 2
                const x = (i * 4 + Math.sin(Date.now() * 0.005)) % canvas.width
                ctx.fillStyle = 'black'
                ctx.fillRect(x, canvas.height - height, 1, height)
            })
            bars.forEach((bar, i) => {
                const height = Math.sin(Date.now() * 0.005 + i) * (canvas.height / 2) + canvas.height / 2
                const x = (i * 4 + Math.sin(Date.now() * 0.005)) % canvas.width
                ctx.fillStyle = 'black'
                ctx.fillRect(x, 0, 1, height)
            })

            requestAnimationFrame(animate)
        }

        animate()
    }, [])

    return (
        <div style={{ background: 'blue' }}>
            <canvas ref={canvasRef} className="w-full h-full" />
        </div>
    )
}

export default WaveformSkeleton
