import { z } from 'zod'

// 업로드 URL 요청에 대한 스키마 정의
export const UploadUrlRequestSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
    id: z.string().optional().default(''),
})

export const CreateTrackSchema = z.object({
    fileName: z.string().min(1),
    playlistId: z.string().optional(),
})

export const TrackIdsSchema = z.object({
    trackIds: z.array(z.string()),
})
