import { UnauthorizedError } from '@/lib/CustomErrors'
import { test, expect, Page } from '@playwright/test'

/**
 * 게스트 사용자 생성 및 성공 확인
 * 응답 상태 및 내용으로 검증
 */
const createGuestUser = async (page: Page): Promise<void> => {
    // '/api/guest/create' 호출을 통해 새 게스트 생성
    const guestResponse = await page.waitForResponse(
        (res) => res.url().includes('/api/guest/create') && res.status() === 200,
    )

    // 응답이 성공적으로 왔는지 확인
    const guestResponseBody = await guestResponse.json()
    expect(guestResponseBody.message).toBe('Guest created')
    expect(guestResponseBody.user).toBeTruthy()
    expect(guestResponseBody.user.role).toBe('GUEST')
}

/**
 * 멤버 로그인 및 성공 확인
 * 응답 상태 및 내용으로 검증
 */
const loginAsMember = async (page: Page): Promise<void> => {
    const loginResponse = await page.request.post('/api/user/login', {
        data: { email: 'test@example.com', password: '1234' },
    })

    expect(loginResponse.status()).toBe(200)

    // 응답 본문에서 회원 정보 확인
    const loginData = await loginResponse.json()
    expect(loginData.id).toBeTruthy()
    expect(loginData.role).toBe('MEMBER')

    // 페이지를 새로고침하여 클라이언트가 로그인 후 동작을 실행하도록 유도
    await page.reload()
}

/**
 * 로그아웃 실행 및 성공 확인
 * 응답 상태로 검증
 */
const logoutUser = async (page: Page): Promise<void> => {
    const logoutResponse = await page.request.post('/api/user/logout')
    expect(logoutResponse.status()).toBe(200)

    // 응답 본문에서 성공 메시지 확인
    const responseData = await logoutResponse.json()
    expect(responseData.success).toBe(true)
}

test.describe('Guest 사용자 접속 테스트', () => {
    test('1. 기본 게스트 토큰 부재 시나리오 (최초 방문/로그아웃 상태)', async ({ page }) => {
        await page.goto('/')

        // 첫 번째 '/api/user/me' 호출은 토큰이 없으므로 UnauthorizedError 응답이어야 함
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 게스트 사용자 생성
        await createGuestUser(page)

        // 이후 '/api/user/me' 호출은 새로운 사용자로 성공해야 함
        const meResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        // 응답에서 게스트 역할 확인
        const userData = await meResponse.json()
        expect(userData.role).toBe('GUEST')
    })

    test('2. 유효한 게스트 인증 상태 시나리오', async ({ page }) => {
        // 페이지를 방문합니다.
        await page.goto('/')

        // 클라이언트 로직에 의해 /api/guest/create 호출이 실행
        await createGuestUser(page)

        // 페이지를 새로고침(refresh)합니다.
        await page.reload()

        // 새로고침 후에도 인증 상태가 유지되는지 확인
        const meResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        // 응답에서 게스트 역할 확인
        const userData = await meResponse.json()
        expect(userData.role).toBe('GUEST')
    })

    test('3. 잘못된 인증 정보 시나리오', async ({ page, context }) => {
        // 페이지 로드 전에 유효하지 않은 토큰을 설정 (이것은 테스트 목적으로만 사용)
        await context.addCookies([
            {
                name: 'guestToken',
                value: 'invalid-guest-token',
                domain: 'localhost',
                path: '/',
            },
        ])

        await page.goto('/')

        // 첫 번째 '/api/user/me' 호출 시 잘못된 토큰으로 인해 UnauthorizedError 응답을 받아야 함
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 클라이언트가 새 게스트 사용자 생성
        await createGuestUser(page)

        // 이후 '/api/user/me' 호출은 새 사용자로 성공해야 함
        const meResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        // 응답에서 게스트 역할 확인
        const userData = await meResponse.json()
        expect(userData.role).toBe('GUEST')
    })

    test('4. 토큰 검사 미들웨어 예외 엔드포인트 (/api/guest/create) 접근 테스트', async ({ request }) => {
        // 토큰 없이도 접근 가능한 엔드포인트에 직접 요청을 보내어 정상 응답을 받는지 검증
        const response = await request.post('/api/guest/create')
        expect(response.status()).toBe(200)
        const body = await response.json()
        expect(body.message).toBe('Guest created')
        expect(body.user).toBeTruthy()
    })
})

test.describe('Member 사용자 접속 테스트', () => {
    test('1. 유효한 멤버 인증 상태 시나리오', async ({ page }) => {
        await page.goto('/')
        await loginAsMember(page)

        // '/api/user/me' 호출 시 인증되어 200 응답이 나와야 함
        const meResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        // 응답에서 멤버 역할 확인
        const userData = await meResponse.json()
        expect(userData.role).toBe('MEMBER')

        // 페이지를 새로고침(refresh)합니다.
        await page.reload()

        // 새로고침 후에도 인증 상태가 유지되는지 확인
        const meResponseAfterReload = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        const userDataAfterReload = await meResponseAfterReload.json()
        expect(userDataAfterReload.role).toBe('MEMBER')
    })

    test('2. 만료된 인증 토큰 시나리오', async ({ page }) => {
        // 1. 페이지 방문
        await page.goto('/')

        // 2. 만료된 토큰 API 호출하여 쿠키 설정
        await page.request.get('/api/test/expired-token')

        // 3. 페이지 새로고침하여 만료된 토큰으로 인증 시도
        await page.reload()

        // 4. 만료된 토큰으로 인한 인증 실패 확인
        await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === UnauthorizedError.status,
        )

        // 5. 클라이언트가 게스트 사용자 생성
        await createGuestUser(page)

        // 6. 새로운 게스트 인증 확인
        const meResponse = await page.request.get('/api/user/me')
        expect(meResponse.status()).toBe(200)
        const userData = await meResponse.json()
        expect(userData.role).toBe('GUEST')
    })

    test('3. 멤버 로그인 플로우', async ({ page }) => {
        // 초기에는 게스트 상태로 시작
        await page.goto('/')
        await createGuestUser(page)

        // 첫 번째 '/api/user/me' 호출은 게스트로 인증되어 성공
        const guestMeResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        const guestUserData = await guestMeResponse.json()
        expect(guestUserData.role).toBe('GUEST')

        // 이제 멤버 로그인을 실행
        await loginAsMember(page)

        // 멤버 토큰을 사용하여 '/api/user/me' 호출이 성공하는지 확인
        const memberMeResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        const memberUserData = await memberMeResponse.json()
        expect(memberUserData.role).toBe('MEMBER')
    })

    test('4. 멤버 로그아웃 플로우', async ({ page }) => {
        // 먼저 로그인된 상태로 시작
        await page.goto('/')
        await loginAsMember(page)

        // 로그인 상태에서 '/api/user/me' 호출이 성공하는지 확인
        const memberMeResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        const memberUserData = await memberMeResponse.json()
        expect(memberUserData.role).toBe('MEMBER')

        // 로그아웃 API 호출
        await logoutUser(page)

        // 로그아웃 후 '/api/user/me' 호출 시 인증 실패해야 함
        const meResponse = await page.request.get('/api/user/me')
        expect(meResponse.status()).toBe(UnauthorizedError.status)

        // 페이지 새로고침하여 클라이언트 로직이 실행되도록 함
        await page.reload()

        // 새로고침 후 게스트 사용자 생성
        await createGuestUser(page)

        // 게스트로 '/api/user/me' 호출이 성공하는지 확인
        const guestMeResponse = await page.waitForResponse(
            (res) => res.url().includes('/api/user/me') && res.status() === 200,
        )

        const guestUserData = await guestMeResponse.json()
        expect(guestUserData.role).toBe('GUEST')

        await page.reload()

        // track과 playlist 데이터 조회 시 200 응답이 나오지만 데이터가 없어야 함
        await Promise.all([
            page.waitForResponse(
                (res) =>
                    res.url().includes('/api/tracks') &&
                    res.status() === 200 &&
                    res.json().then((data) => data.length === 0),
            ),
            page.waitForResponse(
                (res) =>
                    res.url().includes('/api/playlist') &&
                    res.status() === 200 &&
                    res.json().then((data) => data.length === 0),
            ),
        ])

        // UI 반영 검사
        const trackLength = await page.evaluate(() => document.querySelectorAll('#track-list > div').length)
        expect(trackLength).toBe(0)

        const playlistItem = await page.evaluate(() => document.querySelector('.playlist-item'))
        expect(playlistItem).toBeNull()
    })
})
