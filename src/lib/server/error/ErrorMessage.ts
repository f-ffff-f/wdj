// Auth error messages
export enum ErrorMessage {
    // Auth errors
    TURNSTILE_VERIFICATION_FAILED = 'Turnstile verification failed',
    INVALID_CREDENTIALS = 'Invalid credentials',
    INVALID_INPUT = 'Invalid input',
    USER_ALREADY_EXISTS = 'User already exists',
    USER_NOT_FOUND = 'User not found',

    // Track errors
    FAILED_TO_GET_TRACKS = 'Failed to get tracks',
    INVALID_FILE_NAME = 'Invalid file name',
    FAILED_TO_UPLOAD_TRACK = 'Failed to upload track',
    MISSING_FILE_INFO = 'Missing file info',
    FAILED_TO_GET_PRESIGNED_URL = 'Failed to get track presigned url',
    TRACK_NOT_FOUND = 'Track not found',
    FAILED_TO_GET_DOWNLOAD_URL = 'Failed to get track download url',
    FAILED_TO_DELETE_TRACK = 'Failed to delete track',

    // Playlist errors
    FAILED_TO_GET_PLAYLISTS = 'Failed to get playlists',
    PLAYLIST_NOT_FOUND = 'Playlist not found',
    FAILED_TO_FIND_PLAYLIST = 'Failed to find playlist',
    INVALID_PLAYLIST_NAME = 'Invalid playlist name',
    FAILED_TO_CREATE_PLAYLIST = 'Failed to create playlist',
    FAILED_TO_UPDATE_PLAYLIST = 'Failed to update playlist',
    FAILED_TO_DELETE_PLAYLIST = 'Failed to delete playlist',

    // Generic errors
    UNKNOWN_ERROR = 'Unknown error',
}
