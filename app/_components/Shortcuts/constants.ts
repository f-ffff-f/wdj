import { EDeckIds } from '@/app/_lib/types'

export enum EShortcut {
    KeyQ = 'KeyQ',
    KeyA = 'KeyA',
    BracketRight = 'BracketRight',
    Quote = 'Quote',
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

export const SHORTCUTS: { code: EShortcut; label: string; target: string; position?: 'center' | 'bottom' | 'right' }[] =
    [
        { code: EShortcut.KeyQ, label: 'Q', target: `#gain-${EDeckIds.DECK_1}` },
        { code: EShortcut.KeyA, label: 'A', target: `#gain-${EDeckIds.DECK_1}`, position: 'bottom' },
        { code: EShortcut.BracketRight, label: ']', target: `#gain-${EDeckIds.DECK_2}` },
        { code: EShortcut.Quote, label: "'", target: `#gain-${EDeckIds.DECK_2}`, position: 'bottom' },
        { code: EShortcut.KeyZ, label: 'Z', target: `#crossfader` },
        { code: EShortcut.Slash, label: '/', target: `#crossfader`, position: 'right' },
        { code: EShortcut.ShiftLeft, label: 'Shift Left', target: `#play-pause-${EDeckIds.DECK_1}` },
        {
            code: EShortcut.ShiftRight,
            label: 'Shift Right',
            target: `#play-pause-${EDeckIds.DECK_2}`,
            position: 'right',
        },
        { code: EShortcut.Enter, label: 'Enter', target: `#file-uploader` },
        { code: EShortcut.ArrowUp, label: '↑', target: `#vault-list`, position: 'center' },
        { code: EShortcut.ArrowDown, label: '↓', target: `#vault-list`, position: 'bottom' },
        { code: EShortcut.ArrowLeft, label: '←', target: `#vault-list` },
        { code: EShortcut.ArrowRight, label: '→', target: `#vault-list`, position: 'right' },
    ]
