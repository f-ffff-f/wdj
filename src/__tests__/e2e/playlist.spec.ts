import { memberLogin } from '@/__tests__/e2e/util'
import { test } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'

/**
 * Interfaces for API responses
 */
interface Track {
    id: string
    fileName: string
    createdAt: string
}

interface Playlist {
    id: string
    name: string
    tracks?: Track[]
}

/**
 * Playlist API Tests
 * These tests now use server actions instead of API endpoints
 */
test.describe('Playlist Operations', () => {
    let createdPlaylistName: string

    // Setup: Create contexts for guest users
    test.beforeEach(async ({ page }) => {
        try {
            // Use helper to create guest user
            await memberLogin(page)
        } catch (error) {
            console.error('Error during guest setup:', error)
            test.fail(true, 'Setup failed')
        }
    })

    test('should create a new playlist using server action', async ({ page }) => {
        // First, visit the page to get a session
        await page.goto('/main')

        // Wait for page to be loaded
        await page.waitForSelector('body')

        const uniqueName = `Test Playlist ${uuidv4().slice(0, 4)}`

        await page.getByTestId('playlist-input').fill(uniqueName)
        await page.getByTestId('playlist-submit').click()

        await page.pause()
        createdPlaylistName = uniqueName
    })

    // test('should list all playlists using server action', async ({ page }) => {
    //     // Visit the page to get a session
    //     await page.goto('/main')

    //     // Wait for page to be loaded
    //     await page.waitForSelector('body')

    //     // Use evaluate to call the server action
    //     const result = await page.evaluate(async () => {
    //         const res = await fetch('/main/actions', {
    //             method: 'POST',
    //             headers: {
    //                 'X-Action': 'getPlaylists',
    //             },
    //         })

    //         return await res.json()
    //     })

    //     console.log('List playlists response:', result)

    //     // Verify playlists are returned as an array
    //     expect(Array.isArray(result)).toBeTruthy()

    //     // Verify the playlist we created is in the list
    //     if (createdPlaylistName) {
    //         expect(result.some((playlist: Playlist) => playlist.id === createdPlaylistName)).toBeTruthy()
    //     }
    // })

    // test('should add track to playlist', async ({ page }) => {
    //     // Skip if playlist creation failed
    //     test.skip(!createdPlaylistName, 'No playlist created to test with')

    //     // First create a track for the test
    //     await page.goto('/main')
    //     await page.waitForSelector('body')

    //     const uniqueFileName = `test-track-playlist-${uuidv4()}.mp3`

    //     // Create a track first
    //     const trackResult = await page.evaluate(async (fileName) => {
    //         const formData = new FormData()
    //         formData.append('fileName', fileName)

    //         const res = await fetch('/main/actions', {
    //             method: 'POST',
    //             body: formData,
    //             headers: {
    //                 'X-Action': 'uploadTrack',
    //             },
    //         })

    //         return await res.json()
    //     }, uniqueFileName)

    //     createdTrackId = trackResult.id

    //     // Now add the track to the playlist using server action
    //     const result = await page.evaluate(
    //         async (playlistId: string, trackId: string) => {
    //             const res = await fetch('/main/actions', {
    //                 method: 'POST',
    //                 body: JSON.stringify({ playlistId, trackId }),
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     'X-Action': 'addTrackToPlaylist',
    //                 },
    //             })

    //             return await res.json()
    //         },
    //         createdPlaylistName,
    //         createdTrackId,
    //     )

    //     console.log('Add track to playlist response:', result)

    //     // Verify success
    //     expect(result.success).toBeTruthy()

    //     // Verify track is in the playlist
    //     const playlist = await page.evaluate(async (playlistId) => {
    //         const res = await fetch('/main/actions', {
    //             method: 'POST',
    //             body: JSON.stringify({ playlistId }),
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Action': 'getPlaylistById',
    //             },
    //         })

    //         return await res.json()
    //     }, createdPlaylistName)

    //     expect(playlist.tracks).toBeDefined()
    //     expect(playlist.tracks.some((track: Track) => track.id === createdTrackId)).toBeTruthy()

    //     // Clean up the created track
    //     await page.evaluate(async (trackId) => {
    //         await fetch('/main/actions', {
    //             method: 'POST',
    //             body: JSON.stringify({ trackId }),
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Action': 'deleteTrack',
    //             },
    //         })
    //     }, createdTrackId)
    // })

    // test('should delete a playlist using server action', async ({ page }) => {
    //     // Skip if no playlist was created
    //     test.skip(!createdPlaylistName, 'No playlist created to test with')

    //     // Visit the page to get a session
    //     await page.goto('/main')
    //     await page.waitForSelector('body')

    //     // Delete the playlist
    //     const result = await page.evaluate(async (playlistId) => {
    //         const res = await fetch('/main/actions', {
    //             method: 'POST',
    //             body: JSON.stringify({ playlistId }),
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-Action': 'deletePlaylist',
    //             },
    //         })

    //         return await res.json()
    //     }, createdPlaylistName)

    //     console.log('Delete playlist response:', result)

    //     // Verify deletion was successful
    //     expect(result.success).toBeTruthy()

    //     // Verify playlist is no longer in the list
    //     const playlists = await page.evaluate(async () => {
    //         const res = await fetch('/main/actions', {
    //             method: 'POST',
    //             headers: {
    //                 'X-Action': 'getPlaylists',
    //             },
    //         })

    //         return await res.json()
    //     })

    //     expect(playlists.every((playlist: Playlist) => playlist.id !== createdPlaylistName)).toBeTruthy()
    // })
})
