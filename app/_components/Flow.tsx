// flow.tsx
let ctx: AudioContext | undefined = undefined
if (typeof window !== 'undefined') {
    ctx = new AudioContext()
}
export default function Flow() {
    if (!ctx) {
        return null
    }
    console.log(ctx)
    // store.setup({ctx})
    // ...
}
