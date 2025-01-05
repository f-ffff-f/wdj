// flow.tsx
let ctx: AudioContext | undefined = undefined
if (typeof window !== 'undefined') {
    ctx = new AudioContext()
}
const Flow = () => {
    if (!ctx) {
        return null
    }
    console.log(ctx)
    // store.setup({ctx})
    // ...
}

export default Flow
