'use client'
import { DialogDescription } from '@/lib/client/components/ui/dialog'
import { RadioGroup, RadioGroupItem } from '@/lib/client/components/ui/radio-group'
import { Label } from '@radix-ui/react-label'
import { useTheme } from '@/app/ThemeProvider'

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme()

    return (
        <DialogDescription>
            <RadioGroup value={theme} onValueChange={setTheme} className="text-xs">
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
