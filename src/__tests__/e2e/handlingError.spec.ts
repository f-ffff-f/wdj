// import { guestLogin } from '@/__tests__/e2e/util'
// import test from '@playwright/test'

// /**
//  * Test group for error handling and edge cases
//  * Covers invalid inputs and authorization
//  */
// test.describe('Error Handling', () => {
//     test('should return error for invalid input', async ({ page }) => {
//         await guestLogin(page)
//         const response = await guestContext.post('/api/tracks/create', {
//             data: {
//                 // Missing required fileName field
//             },
//         })

//         // Log response for debugging
//         console.log('Invalid input response status:', response.status())

//         // The actual API might return 400 (validation error) or 401 (unauthorized)
//         // Both are valid responses in this context
//         expect([400, 401]).toContain(response.status())
//     })

//     test('should return 401 for unauthorized access', async () => {
//         // Create a context with no auth
//         const unauthContext = await request.newContext({
//             baseURL,
//         })

//         const response = await unauthContext.get('/api/tracks')

//         // Log response for debugging
//         console.log('Unauthorized access response status:', response.status())

//         // Should be unauthorized
//         expect(response.status()).toBe(401)

//         // Clean up
//         await unauthContext.dispose()
//     })
// })
