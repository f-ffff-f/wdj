import { EDeckIds } from '@/lib/client/constants'

export enum EShortcut {
    KeyQ = 'KeyQ',
    KeyA = 'KeyA',
    KeyW = 'KeyW',
    KeyS = 'KeyS',
    BracketRight = 'BracketRight',
    Quote = 'Quote',
    BracketLeft = 'BracketLeft',
    Semicolon = 'Semicolon',
    KeyZ = 'KeyZ',
    Slash = 'Slash',
    ShiftLeft = 'ShiftLeft',
    ShiftRight = 'ShiftRight',
    Enter = 'Enter',
    ArrowUp = 'ArrowUp',
    ArrowDown = 'ArrowDown',
    ArrowLeft = 'ArrowLeft',
    ArrowRight = 'ArrowRight',
}

type ShortcutConfig = {
    label: string
    target: string
    position?: 'center' | 'bottom' | 'right'
}

type AllShortcutsCheck = Record<EShortcut, ShortcutConfig>

export const UI_SHORTCUTS: AllShortcutsCheck = {
    [EShortcut.KeyQ]: { label: 'Q', target: `#speed-${EDeckIds.DECK_1}` },
    [EShortcut.KeyA]: { label: 'A', target: `#speed-${EDeckIds.DECK_1}`, position: 'bottom' },
    [EShortcut.KeyW]: { label: 'W', target: `#gain-${EDeckIds.DECK_1}` },
    [EShortcut.KeyS]: { label: 'S', target: `#gain-${EDeckIds.DECK_1}`, position: 'bottom' },
    [EShortcut.BracketRight]: { label: ']', target: `#speed-${EDeckIds.DECK_2}` },
    [EShortcut.Quote]: { label: '"', target: `#speed-${EDeckIds.DECK_2}`, position: 'bottom' },
    [EShortcut.BracketLeft]: { label: '[', target: `#gain-${EDeckIds.DECK_2}` },
    [EShortcut.Semicolon]: { label: ';', target: `#gain-${EDeckIds.DECK_2}`, position: 'bottom' },
    [EShortcut.KeyZ]: { label: 'Z', target: `#crossfader` },
    [EShortcut.Slash]: { label: '/', target: `#crossfader`, position: 'right' },
    [EShortcut.ShiftLeft]: { label: 'Shift Left', target: `#play-pause-${EDeckIds.DECK_1}` },
    [EShortcut.ShiftRight]: { label: 'Shift Right', target: `#play-pause-${EDeckIds.DECK_2}`, position: 'right' },
    [EShortcut.Enter]: { label: 'Enter', target: `#file-uploader` },
    [EShortcut.ArrowUp]: { label: '↑', target: `#track-list`, position: 'center' },
    [EShortcut.ArrowDown]: { label: '↓', target: `#track-list`, position: 'bottom' },
    [EShortcut.ArrowLeft]: { label: '←', target: `#track-list` },
    [EShortcut.ArrowRight]: { label: '→', target: `#track-list`, position: 'right' },
}
