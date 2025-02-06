import { test, expect } from '@playwright/test'

test('Google 검색 페이지 테스트', async ({ page }) => {
    await page.goto('https://www.google.com')
    await expect(page).toHaveTitle(/Google/)
})
