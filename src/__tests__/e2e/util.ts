import { expect, Page } from '@playwright/test'
import path from 'path'
import fs from 'fs'

export async function hydrateTurnstile(page: Page) {
    await page.reload()
}

export async function guestLogin(page: Page) {
    await page.goto('/')

    await hydrateTurnstile(page)

    await page.getByTestId('guest-signin-button').click()
    await page.waitForURL((url) => url.pathname.includes('/main'))
    await expect(page.getByText('Guest')).toBeVisible()
}

export async function memberLogin(page: Page) {
    const testEmail = process.env.PLAYWRIGHT_TEST_USER_EMAIL
    const testPassword = process.env.PLAYWRIGHT_TEST_USER_PASSWORD

    if (!testEmail || !testPassword) {
        console.error('Test credentials not provided')
        throw new Error('Test credentials not provided')
    }

    await page.goto('/')

    await hydrateTurnstile(page)

    await page.getByTestId('email-input').fill(testEmail)
    await page.getByTestId('password-input').fill(testPassword)
    await page.getByTestId('signin-button').click()
    await page.waitForURL((url) => url.pathname.includes('/main'))
    await expect(page.getByText(testEmail)).toBeVisible()
}

export async function createTrack(page: Page) {
    const fixturesDir = path.join(__dirname, 'fixtures')
    if (!fs.existsSync(fixturesDir)) {
        fs.mkdirSync(fixturesDir, { recursive: true })
    }

    const filePath = path.join(fixturesDir, 'test-audio.mp3')
    if (!fs.existsSync(filePath)) {
        // 간단한 바이너리 파일 생성
        const buffer = Buffer.alloc(4096)
        buffer.write('ID3', 0) // MP3 시그니처
        fs.writeFileSync(filePath, buffer)
        console.log(`Created test MP3 file at ${filePath}`)
    }

    // 실제로 input에 파일 넣기
    const fileInput = await page.$('input[type="file"]#file-uploader')
    await fileInput?.setInputFiles(filePath)
}
