import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Check, X } from 'lucide-react'
import { FC, useEffect } from 'react'

const playlistSchema = z.object({
    name: z
        .string()
        .min(1, 'Playlist name must be at least 1 character')
        .max(50, 'Playlist name cannot exceed 50 characters'),
})

type PlaylistFormData = z.infer<typeof playlistSchema>

type Props = {
    onSubmit: (data: PlaylistFormData) => void
    isSubmitting: boolean
    placeholder: string

    // edit mode
    initialValue?: string
    onCancel?: () => void
}

const PlaylistForm: FC<Props> = ({ onSubmit, isSubmitting, initialValue = '', onCancel, placeholder }) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PlaylistFormData>({
        resolver: zodResolver(playlistSchema),
        defaultValues: { name: initialValue },
    })

    // initialValue가 바뀔 경우 form을 갱신
    useEffect(() => {
        reset({ name: initialValue })
    }, [initialValue, reset])

    const onFormSubmit = (data: PlaylistFormData) => {
        onSubmit(data)
        reset({ name: '' })
    }

    // onCancel이 전달되면 수정 모드로 판단
    const isEditing = !!onCancel

    return (
        <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="flex w-full items-center space-x-2">
                <Input
                    type="text"
                    placeholder={placeholder}
                    {...register('name')}
                    className="h-8"
                    disabled={isSubmitting}
                />
                {onCancel && (
                    <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={onCancel}
                        title="Cancel"
                    >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                    </Button>
                )}
                <Button
                    type="submit"
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    title={isEditing ? 'Update Playlist' : 'Add Playlist'}
                    disabled={isSubmitting}
                >
                    {isEditing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span className="sr-only">{isEditing ? 'Update Playlist' : 'Add Playlist'}</span>
                </Button>
            </div>
            {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
        </form>
    )
}

export default PlaylistForm
