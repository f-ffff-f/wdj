'use client'
import { DialogDescription } from '@/lib/client/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/lib/client/components/ui/radio-group'
import { Label } from '@radix-ui/react-label'
import React, { useState, useEffect } from 'react'

export const ThemeToggle = () => {
    const [theme, setTheme] = useState<'light' | 'dark'>('dark')

    // 테마 적용 함수
    const applyTheme = (selectedTheme: typeof theme) => {
        const isDark = selectedTheme === 'dark'
        document.documentElement.classList.toggle('dark', isDark)
        localStorage.setItem('theme', selectedTheme)
        setTheme(selectedTheme)
    }

    // 초기 테마 설정
    useEffect(() => {
        const savedTheme = (localStorage.getItem('theme') as typeof theme) || 'dark'
        applyTheme(savedTheme)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <DialogDescription>
            <RadioGroup value={theme} onValueChange={applyTheme} className="text-xs">
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light Mode</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark Mode</Label>
                </div>
            </RadioGroup>
        </DialogDescription>
    )
}
