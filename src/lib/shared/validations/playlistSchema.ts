import { z } from 'zod'

export const PlaylistSchema = z.object({
    name: z
        .string()
        .min(1, 'Playlist name must be at least 1 character')
        .max(50, 'Playlist name cannot exceed 50 characters'),
})
