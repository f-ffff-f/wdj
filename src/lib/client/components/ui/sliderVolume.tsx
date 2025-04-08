'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from '@/lib/client/utils'

const SliderVolume = React.forwardRef<
    React.ElementRef<typeof SliderPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
    <SliderPrimitive.Root
        orientation="vertical"
        ref={ref}
        className={cn(
            'relative flex items-center',
            'data-[orientation=vertical]:flex-col data-[orientation=vertical]:w-5 data-[orientation=vertical]:h-24',
            className,
        )}
        {...props}
    >
        <SliderPrimitive.Track className={cn('relative flex-grow bg-primary/20', 'data-[orientation=vertical]:w-0.5')}>
            <SliderPrimitive.Range className={cn('absolute bg-primary', 'data-[orientation=vertical]:w-full')} />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
))

SliderVolume.displayName = SliderPrimitive.Root.displayName

export { SliderVolume }
