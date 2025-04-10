import { memberLogin, createTrack } from '@/__tests__/e2e/util'
import { test, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { PLAYLIST_DEFAULT_ID } from '@/lib/shared/constants'

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
    let createdTrackId: string

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

    test('should create a new playlist using server action and navigate to its page', async ({ page }) => {
        // First, visit the page to get a session
        await page.goto('/main')

        // Wait for page to be loaded
        await page.waitForSelector('body')

        const uniqueName = `Test Playlist ${uuidv4().slice(0, 4)}`

        await page.getByTestId('playlist-input').fill(uniqueName)
        await page.getByTestId('playlist-submit').click()

        createdPlaylistName = uniqueName

        const playlistElement = page.getByRole('link', { name: createdPlaylistName })
        await playlistElement.waitFor({ state: 'visible' })

        // Verify clicking the playlist navigates to its page
        await playlistElement.click()

        // Verify the URL contains the playlist ID
        await page.waitForURL((url) => url.toString().includes('/main/') && !url.toString().includes('/main/library'))
    })

    test('should add track to playlist and delete track from playlist', async ({ page }) => {
        // Skip if no playlist was created
        test.skip(!createdPlaylistName, 'No playlist created to test with')

        // Navigate to main page
        await page.goto('/main')

        // Create a track using the utility function
        await createTrack(page)

        // Extract the track ID from the data-trackid attribute
        createdTrackId = (await page
            .locator(`[data-testid^="track-item-"]`)
            .first()
            .getAttribute('data-trackid')) as string

        // Open track options menu - use the correct selector based on TrackList.tsx
        await page.getByTestId(`dropdown-trigger-${createdTrackId}`).click()

        // Hover "Add to Playlist" option
        await page.getByText('Add to Playlist').hover()

        // Select our created playlist
        await page.waitForTimeout(2000)
        await page.locator('role=menu').getByText(createdPlaylistName).click()

        // Navigate to the playlist
        const playlistElement = page.getByRole('link', { name: createdPlaylistName })
        await page.waitForTimeout(2000)
        await playlistElement.click()

        // Wait for the playlist page to load
        await page.waitForURL((url) => url.toString().includes('/main/') && !url.toString().includes('/main/library'))

        // Now delete the track from the playlist
        // Open dropdown menu for the track in the playlist
        await page.waitForTimeout(2000)
        // await page.getByTestId(`dropdown-trigger-${createdTrackId}`).click()
        // 더 간단한 접근법으로 변경
        await page.locator('[data-testid^="track-item-"]').first().locator('svg').last().click()

        // Click "Delete Track from Playlist" option
        await page.getByText('Delete Track from Playlist').click()

        // Verify the track is removed from the playlist
        await page.waitForTimeout(1000) // Wait for UI update
        const trackCount = await page.locator('#track-list > *').count()
        expect(trackCount).toBe(0)
    })

    test('should rename anddelete a playlist using server action', async ({ page }) => {
        // Skip if no playlist was created
        test.skip(!createdPlaylistName, 'No playlist created to test with')

        // Navigate to main page
        await page.goto('/main')
        await page.waitForSelector('body')

        // Verify the created playlist is visible in the sidebar
        const playlistElement = page.getByRole('link', { name: createdPlaylistName })
        await playlistElement.waitFor({ state: 'visible' })

        // Find the dropdown trigger for the playlist
        // First locate the playlist's parent container
        const playlistContainer = playlistElement.locator('xpath=./ancestor::li')

        // Click the dropdown menu button (the MoreHorizontal icon)
        // The previous selector was incorrect, use a more reliable one
        await playlistContainer.getByRole('button').last().click()

        // Click "Rename Playlist" option
        await page.getByText('Rename Playlist').click()

        // Wait for the rename form to appear and fill it with a new name
        const updatedName = `Renamed ${createdPlaylistName}`
        await page.getByTestId('playlist-input').last().fill(updatedName)
        await page.getByTestId('playlist-submit').last().click()

        // Wait for the rename to complete
        await page.waitForTimeout(1000)

        // Verify the playlist was renamed
        const renamedPlaylistElement = page.getByRole('link', { name: updatedName })
        await renamedPlaylistElement.waitFor({ state: 'visible' })

        // Now delete the renamed playlist
        // First locate the playlist's parent container
        const renamedPlaylistContainer = renamedPlaylistElement.locator('xpath=./ancestor::li')

        // Click the dropdown menu button again
        await renamedPlaylistContainer.getByRole('button').last().click()

        // Click "Delete Playlist" option
        await page.getByText('Delete Playlist').click()

        // Wait for deletion to complete
        await page.waitForTimeout(1000)

        // Verify we're redirected to the library page
        await page.waitForURL((url) => url.toString().includes(`/main/${PLAYLIST_DEFAULT_ID}`))

        // Verify the playlist no longer appears in the sidebar
        const playlistExists = (await page.getByRole('link', { name: updatedName }).count()) > 0
        expect(playlistExists).toBe(false)
    })
})
