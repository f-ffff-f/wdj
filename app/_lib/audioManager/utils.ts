const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value))

export const clampGain = (value: number): number => clamp(value, 0, 1)
