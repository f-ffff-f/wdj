/** @deprecated */
export enum BadRequestErrorMessage {
    INVALID_TRACK_IDS = 'Invalid track IDs format',
    INVALID_PLAYLIST_NAME = 'Invalid playlist name',
    INVALID_FILE_NAME = 'Invalid file name',
    MISSING_FILE_INFO = 'fileName and fileType are required',
    USER_ALREADY_EXISTS = 'User already exists',
    INVALID_EMAIL = 'Please enter a valid email address',
    INVALID_PASSWORD = 'Password must be at least 8 characters',
    INVALID_INPUT = 'Invalid input data',
    INVALID_TURNSTILE_TOKEN = 'Invalid turnstile token',
}

/** @deprecated */
export enum UnauthorizedErrorMessage {
    INVALID_TOKEN = 'Invalid token',
    TOKEN_NOT_EXIST = 'Token is not exist',
    USER_NOT_AUTHENTICATED = 'User not authenticated',
    INVALID_CREDENTIALS = 'Invalid credentials',
    INVALID_GUEST_USER_ID = 'Invalid guest user ID',
}

/** @deprecated */
export enum NotFoundErrorMessage {
    USER_NOT_FOUND = 'User not found',
    PLAYLIST_NOT_FOUND = 'Playlist not found',
    TRACK_NOT_FOUND = 'Track not found',
    TRACK_UNAUTHORIZED = 'Track not found or unauthorized',
}
