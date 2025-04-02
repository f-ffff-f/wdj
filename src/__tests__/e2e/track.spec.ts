// import { test, expect, APIRequestContext } from '@playwright/test'
// import { v4 as uuidv4 } from 'uuid'
// import { createGuestUser, guestLogin, callServerAction } from './test-utils'

// // Base URL for the API
// const baseURL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000'

// /**
//  * Interfaces for API responses
//  */
// interface Track {
//     id: string
//     fileName: string
//     createdAt: string
// }

// /**
//  * Track API Tests
//  * These tests now use server actions instead of API endpoints
//  */
// test.describe('Track Operations', () => {
//     let guestContext: APIRequestContext
//     let guestUserId: string
//     let createdTrackId: string

//     // Setup: Create contexts for guest users
//     test.beforeAll(async () => {
//         test.setTimeout(60000) // Increase timeout for setup

//         try {
//             // Use helper to create guest user
//             const { guestContext: context, guestUserId: userId } = await createGuestUser();
//             guestContext = context;
//             guestUserId = userId;

//             console.log('Guest user created with ID:', guestUserId);
//         } catch (error) {
//             console.error('Error during guest setup:', error);
//             test.fail(true, 'Setup failed');
//         }
//     })

//     // Cleanup contexts after all tests
//     test.afterAll(async () => {
//         await guestContext.dispose()
//     })

//     test('should create a new track using server action', async ({ page }) => {
//         // Login as guest
//         await guestLogin(page);

//         const uniqueFileName = `test-track-${uuidv4()}.mp3`;

//         // Create form data
//         const formData = new FormData();
//         formData.append('fileName', uniqueFileName);

//         // Use helper to call server action
//         const result = await callServerAction(page, 'uploadTrack', formData);

//         console.log('Create track response:', result);

//         // Verify track was created
//         expect(result.id).toBeDefined();
//         expect(result.fileName).toBe(uniqueFileName);

//         // Save for use in later tests
//         createdTrackId = result.id;
//     });

//     test('should list all tracks using server action', async ({ page }) => {
//         // Login as guest
//         await guestLogin(page);

//         // Use helper to call server action
//         const result = await callServerAction(page, 'getTracks', { playlistId: 'default' });

//         console.log('List tracks response:', result);

//         // Verify tracks are returned as an array
//         expect(Array.isArray(result)).toBeTruthy();

//         // Verify the track we created is in the list
//         if (createdTrackId) {
//             expect(result.some((track: Track) => track.id === createdTrackId)).toBeTruthy();
//         }
//     });

//     test('should get presigned URL for track upload using server action', async ({ page }) => {
//         // Skip if no track was created
//         test.skip(!createdTrackId, 'No track created to test with');

//         // Visit the page to get a session
//         await page.goto('/main');

//         // Wait for page to be loaded
//         await page.waitForSelector('body');

//         // Use evaluate to call the server action
//         const result = await page.evaluate(async (trackId) => {
//             const res = await fetch('/main/actions', {
//                 method: 'POST',
//                 body: JSON.stringify({
//                     id: trackId,
//                     fileName: 'test.mp3',
//                     fileType: 'audio/mpeg'
//                 }),
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Action': 'getTrackPresignedUrl'
//                 }
//             });

//             return await res.json();
//         }, createdTrackId);

//         console.log('Presigned URL response:', result);

//         // Verify presigned URL is returned
//         expect(result.url).toBeDefined();
//         expect(result.url).toContain('https://');
//         expect(result.key).toBeDefined();
//     });

//     test('should delete a track using server action', async ({ page }) => {
//         // Skip if no track was created
//         test.skip(!createdTrackId, 'No track created to test with');

//         // Visit the page to get a session
//         await page.goto('/main');

//         // Wait for page to be loaded
//         await page.waitForSelector('body');

//         // Use evaluate to call the server action
//         const result = await page.evaluate(async (trackId) => {
//             const res = await fetch('/main/actions', {
//                 method: 'POST',
//                 body: JSON.stringify({ trackId }),
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Action': 'deleteTrack'
//                 }
//             });

//             return await res.json();
//         }, createdTrackId);

//         console.log('Delete track response:', result);

//         // Verify deletion was successful
//         expect(result.success).toBe(true);

//         // Verify track is removed from the list
//         const tracks = await page.evaluate(async () => {
//             const res = await fetch('/main/actions', {
//                 method: 'POST',
//                 body: JSON.stringify({ playlistId: 'default' }),
//                 headers: {
//                     'Content-Type': 'application/json',
//                     'X-Action': 'getTracks'
//                 }
//             });

//             return await res.json();
//         });

//         expect(tracks.every((track: Track) => track.id !== createdTrackId)).toBeTruthy();
//     });
// })
