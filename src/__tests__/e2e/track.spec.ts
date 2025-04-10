import { test, expect } from '@playwright/test'
import { createTrack, memberLogin } from './util'
import path from 'path'
import fs from 'fs'

/**
 * Track API Tests
 * These tests now use server actions instead of API endpoints
 */
let createdTrackId: string

test.describe('Track Operations', () => {
    // Cleanup contexts after all tests
    test.afterEach(async ({ page }) => {
        await page.goto('/main')
        await page.getByRole('button', { name: 'Sign Out' }).click()
    })

    test('should upload an audio file via FileUploader', async ({ page }) => {
        await page.goto('/main') // FileUploader가 포함된 경로

        await memberLogin(page)

        await createTrack(page)

        createdTrackId = (await page
            .locator(`[data-testid^="track-item-"]`)
            .first()
            .getAttribute('data-trackid')) as string

        expect(!!createdTrackId).toBe(true)
    })

    test('should list all tracks using server action', async ({ page }) => {
        // // Login as member
        await memberLogin(page)

        // Verify the track we created is in the list
        await page.waitForTimeout(2000)
        const _createdTrackId = (await page.locator('#track-list > *').first().getAttribute('data-trackid')) as string
        expect(_createdTrackId).toBe(createdTrackId)
    })

    test('should delete a track using server action', async ({ page }) => {
        // Skip if no track was created
        await memberLogin(page)
        // Visit the page to get a session
        await page.goto('/main')

        await page.getByTestId(`dropdown-trigger-${createdTrackId}`).click()

        await expect(page.getByTestId(`dropdown-content-${createdTrackId}`)).toBeVisible()

        // Delete the track from the library using id
        await page.getByTestId(`dropdown-item-delete-${createdTrackId}`).click()

        await expect(page.locator(`#track-list > *[key="${createdTrackId}"]`)).toHaveCount(0)
    })
})
