'use client'

import WaveformSkeleton from '@/app/main/components/DJController/WaveformSkeleton'
import { TDeckId } from '@/lib/client/types'
import { deckoSingleton } from '@ghr95223/decko'
import React, { useRef, useEffect, useState, useCallback } from 'react'

const Waveform = ({ deckId }: { deckId: TDeckId }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const audioBuffer = deckoSingleton.getAudioBuffer(deckId)
    const playbackTime = deckoSingleton.getPlaybackTime(deckId)
    const isTrackLoading = deckoSingleton.isTrackLoading(deckId)

    const [isDragging, setIsDragging] = useState(false)
    const [dragX, setDragX] = useState<number | null>(null)

    const drawWaveform = useCallback(() => {
        if (!canvasRef.current || !audioBuffer) return

        const canvas = canvasRef.current
        canvas.width = containerRef.current?.offsetWidth ?? 0
        canvas.height = containerRef.current?.offsetHeight ?? 0
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const { width, height } = canvas
        ctx.clearRect(0, 0, width, height)

        // 채널 데이터 가져오기
        const channelData = audioBuffer.getChannelData(0)
        const step = Math.ceil(channelData.length / width)
        const waveform = []

        for (let i = 0; i < width; i++) {
            const start = i * step
            const end = Math.min(start + step, channelData.length)
            let min = 1.0
            let max = -1.0

            for (let j = start; j < end; j++) {
                const value = channelData[j]
                if (value < min) min = value
                if (value > max) max = value
            }

            waveform.push({ min, max })
        }

        // 파형 그리기
        ctx.beginPath()
        waveform.forEach((point, i) => {
            const x = i
            const yMin = (1 - point.min) * (height / 2)
            const yMax = (1 - point.max) * (height / 2)

            ctx.moveTo(x, yMin)
            ctx.lineTo(x, yMax)
        })
        ctx.strokeStyle = 'blue'
        ctx.stroke()
    }, [audioBuffer])

    const drawPlayhead = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas || !audioBuffer) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const { width, height } = canvas
        const duration = audioBuffer.duration

        // x 좌표 계산 (currentTime 기반 또는 드래그 중이면 dragX 사용)
        const x = isDragging && dragX !== null ? dragX : (playbackTime / duration) * width

        // 플레이 헤드 그리기
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, height)
        ctx.strokeStyle = 'white'
        ctx.lineWidth = 2
        ctx.stroke()
    }, [audioBuffer, playbackTime, isDragging, dragX])

    useEffect(() => {
        drawWaveform()
        drawPlayhead()
    }, [drawPlayhead, drawWaveform])

    const handleMouseDown = (e: React.MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return

        const rect = canvas.getBoundingClientRect()
        const x = e.clientX - rect.left
        setIsDragging(true)
        setDragX(x)
    }

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !canvasRef.current || !audioBuffer) return
        const duration = audioBuffer.duration

        const rect = canvasRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const time = (x / rect.width) * duration

        setDragX(x)
        deckoSingleton.seekDeck(deckId, time)
    }

    const handleMouseUp = () => {
        if (!isDragging || !canvasRef.current || !audioBuffer) return

        const canvas = canvasRef.current
        const duration = audioBuffer.duration
        const rect = canvas.getBoundingClientRect()
        const x = dragX ?? 0
        const time = (x / rect.width) * duration

        setIsDragging(false)
        setDragX(null)
        deckoSingleton.seekDeck(deckId, time)
    }

    return (
        <div ref={containerRef} className="max-md:w-full md:flex-1">
            {isTrackLoading ? (
                <WaveformSkeleton />
            ) : (
                <canvas
                    ref={canvasRef}
                    width="100%"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp} // 드래그 중 캔버스 벗어나도 정리
                />
            )}
        </div>
    )
}

export default Waveform
