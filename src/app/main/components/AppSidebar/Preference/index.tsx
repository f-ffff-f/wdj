import StorageIndicator from '@/app/main/components/AppSidebar/Preference/StorageIndicator'
import { ThemeToggle } from '@/app/main/components/AppSidebar/Preference/ThemeToggle'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/lib/client/components/ui/dialog'
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
