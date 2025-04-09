import { expect, Page } from '@playwright/test'

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
