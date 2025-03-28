/**
 * API path constants used throughout the application
 */

/** Base API path */
export const API_BASE = '/api'

/** Track related endpoints */
export const API_TRACKS = `${API_BASE}/tracks`

/** Playlist related endpoints */
export const API_PLAYLISTS = `${API_BASE}/playlists`

/** React Query keys */
export const QUERY_KEYS = {
    /** Track related query keys */
    TRACKS: API_TRACKS.split('/'),

    /** Playlist related query keys */
    PLAYLIST: API_PLAYLISTS.split('/'),
}
