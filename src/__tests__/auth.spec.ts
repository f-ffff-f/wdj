import { UnauthorizedError } from '@/lib/CustomErrors'
import { test, expect, Page } from '@playwright/test'

const obtainGuestToken = async (page: Page): Promise<string> => {
    // '/api/guest/create' 호출을 통해 새 게스트 토큰 발급
    const guestResponse = await page.waitForResponse(
        (res) => res.url().includes('/api/guest/create') && res.status() === 200,
    )
    const guestResponseBody = await guestResponse.json()

    // 새로 발급받은 토큰이 sessionStorage에 저장되어야 함
    const guestToken = await page.evaluate(() => sessionStorage.getItem('guestToken'))

    expect(guestToken).toBe(guestResponseBody.token)
    return guestResponseBody.token
}

const obtainMemberToken = async (page: Page): Promise<string> => {
    const loginResponse = await page.request.post('/api/user/login', {
        data: { email: 'test@example.com', password: '1234' },
    })

    expect(loginResponse.status()).toBe(200)
    expect(loginResponse.status()).toBe(200)

    const loginData = await loginResponse.json()

    const memberToken = loginData.token
    expect(memberToken).toBeTruthy() // 토큰이 존재하는지 검증

    // localStorage에 저장
    await page.evaluate((token) => {
        localStorage.setItem('token', token)
    }, memberToken)

    // 페이지를 새로고침하여 클라이언트가 로그인 후 동작을 실행하도록 유도
    await page.reload()

    return memberToken
}

test.describe('Guest 사용자 접속 테스트', () => {
    test('1. 기본 게스트 토큰 부재 시나리오 (최초 방문/로그아웃 상태)', async ({ page }) => {
        await page.goto('/')

        // 첫 번째 '/api/user/me' 호출은 토큰이 없으므로 UnauthorizedError 응답이어야 함
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 인증 실패 후 클라이언트가 브라우저 스토리지에서 토큰을 삭제함 (수동 제거 혹은 클라이언트 로직에 의해)
        await page.evaluate(() => {
            localStorage.removeItem('token')
            sessionStorage.removeItem('guestToken')
        })

        await obtainGuestToken(page)

        // 이후 '/api/user/me' 호출은 새로운 토큰으로 성공해야 함
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)
    })

    test('2. 유효한 게스트 토큰 존재 시나리오 (세션스토리지에만 토큰 있음)', async ({ page }) => {
        // 페이지를 방문합니다.
        await page.goto('/')

        // 클라이언트 로직에 의해 /api/guest/create 호출이 실행되고, 토큰이 발급되어 sessionStorage에 저장됩니다.
        const token = await obtainGuestToken(page)

        // 발급받은 토큰이 존재함을 먼저 확인합니다.
        const guestTokenBeforeReload = await page.evaluate(() => sessionStorage.getItem('guestToken'))
        expect(guestTokenBeforeReload).toBe(token)

        // 페이지를 새로고침(refresh)합니다.
        await page.reload()

        // 새로고침 후에도 sessionStorage에 동일한 guestToken이 유지되어야 합니다.
        const guestTokenAfterReload = await page.evaluate(() => sessionStorage.getItem('guestToken'))
        expect(guestTokenAfterReload).toBe(token)

        // 새로고침 후, '/api/user/me' 호출이 sessionStorage에 있는 토큰을 사용하여 성공해야 합니다.
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)
    })

    test('3. 세션스토리지에 있는 게스트 토큰이 잘못된(유효하지 않은) 토큰인 경우', async ({ page }) => {
        // 페이지 로드 전에 유효하지 않은 guest 토큰을 미리 설정
        await page.addInitScript(() => {
            sessionStorage.setItem('guestToken', 'invalid-guest-token')
        })

        await page.goto('/')

        // 첫 번째 '/api/user/me' 호출 시 잘못된 토큰으로 인해 UnauthorizedError 응답을 받아야 함
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 클라이언트가 스토리지를 클리어한 후 '/api/guest/create'를 호출하여 새 토큰을 발급받음
        const responseToken = await obtainGuestToken(page)

        // 새로 발급받은 토큰이 sessionStorage에 저장되었는지 검증
        const guestToken = await page.evaluate(() => sessionStorage.getItem('guestToken'))
        expect(guestToken).toBe(responseToken)

        // 이후 '/api/user/me' 호출은 새 토큰으로 성공해야 함
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)
    })

    test('4. 토큰 검사 미들웨어 예외 엔드포인트 (/api/guest/create) 접근 테스트', async ({ request }) => {
        // 토큰 없이도 접근 가능한 엔드포인트에 직접 요청을 보내어 정상 응답을 받는지 검증
        const response = await request.post('/api/guest/create')
        expect(response.status()).toBe(200)
        const body = await response.json()
        expect(body.token).toBeTruthy()
    })
})

////////////////////////////////////////////////////////////

test.describe('Member 사용자 접속 테스트', () => {
    test('1. 유효한 멤버 토큰 존재 시나리오 (localStorage에만 토큰 있음)', async ({ page }) => {
        await page.goto('/')
        const responseMemberToken = await obtainMemberToken(page)

        // '/api/user/me' 호출 시 localStorage의 토큰으로 인증되어 200 응답이 나와야 함
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)

        // 페이지를 새로고침(refresh)합니다.
        await page.reload()

        // 저장된 토큰이 변경되지 않았음을 확인합니다.
        const storedToken = await page.evaluate(() => localStorage.getItem('token'))
        expect(storedToken).toBe(responseMemberToken)
    })

    test('2. 로컬스토리지에 있는 멤버 토큰이 잘못된(유효하지 않은) 토큰인 경우', async ({ page }) => {
        // 페이지 로드 전에 localStorage에 유효하지 않은 멤버 토큰을 설정합니다.
        await page.addInitScript(() => {
            localStorage.setItem('token', 'invalid-member-token')
        })

        await page.goto('/')

        // 첫 번째 '/api/user/me' 호출은 invalid token 때문에 Unauthorized 응답(예: 401)을 받아야 합니다.
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 클라이언트 로직에 의해 저장소가 클리어되고, /api/guest/create를 통해 새로운 게스트 토큰이 발급됩니다.
        const responseGuestToken = await obtainGuestToken(page)

        // localStorage는 클리어되었어야 합니다.
        const memberToken = await page.evaluate(() => localStorage.getItem('token'))
        expect(memberToken).toBeNull()

        // 새로 발급받은 토큰이 sessionStorage(게스트 토큰) 에 저장되었는지 확인합니다.
        const guestToken = await page.evaluate(() => sessionStorage.getItem('guestToken'))
        expect(guestToken).toBe(responseGuestToken)

        // 이후 '/api/user/me' 호출은 새 토큰(게스트 토큰)으로 인증되어 200 응답을 받아야 합니다.
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)
    })

    test('3. 멤버 로그인 플로우', async ({ page, request }) => {
        // 초기에는 게스트 상태로 sessionStorage에 토큰이 있는 상황을 시뮬레이션합니다.
        await page.goto('/')
        await obtainGuestToken(page)

        // 첫 번째 '/api/user/me' 호출은 guest 토큰으로 인증되어 성공합니다.
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)

        // 이제 멤버 로그인을 시뮬레이션합니다.
        const responseMemberToken = await obtainMemberToken(page)

        // local storage에 있는지 검사
        const storedMemberToken = await page.evaluate(() => localStorage.getItem('token'))
        expect(storedMemberToken).toBe(responseMemberToken)

        // 멤버 토큰을 사용하여 '/api/user/me' 호출이 성공하는지 확인합니다.
        await page.waitForResponse((res) => res.url().includes('/api/user/me') && res.status() === 200)
    })
})
