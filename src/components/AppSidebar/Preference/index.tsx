import StorageIndicator from '@/components/AppSidebar/Preference/StorageIndicator'
import { ThemeToggle } from '@/components/AppSidebar/Preference/ThemeToggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { SettingsIcon } from 'lucide-react'
import React from 'react'

const Preference = () => {
    return (
        <Dialog>
            <DialogTrigger className="self-end">
                <SettingsIcon />
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Preferences</DialogTitle>
                </DialogHeader>
                <StorageIndicator />
                <ThemeToggle />
            </DialogContent>
        </Dialog>
    )
}

export default Preference
