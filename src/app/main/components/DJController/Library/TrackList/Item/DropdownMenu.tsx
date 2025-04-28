'use client'

import React from 'react'
import { MoreVertical } from 'lucide-react'
import { SidebarMenuAction } from '@/lib/client/components/ui/sidebar'
import {
    DropdownMenu as _DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
} from '@/lib/client/components/ui/dropdown-menu'

export interface DropdownMenuProps {
    trackId: string
    children: React.ReactNode
}

const DropdownMenu = ({ trackId, children }: DropdownMenuProps) => {
    return (
        <_DropdownMenu>
            <DropdownMenuTrigger asChild className="top-1/2 transform -translate-y-1/2 right-1">
                <SidebarMenuAction data-testid={`dropdown-trigger-${trackId}`}>
                    <MoreVertical />
                </SidebarMenuAction>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="center" data-testid={`dropdown-content-${trackId}`}>
                {children}
            </DropdownMenuContent>
        </_DropdownMenu>
    )
}

export default DropdownMenu
