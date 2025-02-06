import { UnauthorizedError } from '@/lib/CustomErrors'
import { test, expect } from '@playwright/test'

// Mock 데이터
test.describe('Guest 사용자 흐름 테스트', () => {
    test('API 요청 흐름 테스트', async ({ page }) => {
        page.on('request', (request) => {
            console.log(`➡️ 요청: ${request.method()} ${request.url()}`)
        })
        page.on('response', async (response) => {
            console.log(`⬅️ 응답: ${response.status()} ${response.url()}`)
        })

        await page.goto('/')

        // 첫 번째 '/api/user/me' 호출 후 실패해야 함
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 인증 실패 후 localStorage와 sessionStorage에서 토큰 삭제
        await page.evaluate(() => {
            localStorage.removeItem('token')
            sessionStorage.removeItem('guestToken')
        })

        // '/api/guest/create' 호출 후 guestToken이 sessionStorage에 저장되어야 함
        const guestResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/guest/create') && res.status() === 200,
        )
        const guestResponseBody = await guestResponse.json()

        const guestToken = await page.evaluate(() => sessionStorage.getItem('guestToken'))

        expect(guestToken).toBe(guestResponseBody.token)

        // 두 번째 '/api/user/me' 호출 후 성공해야 함
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)
    })
})
