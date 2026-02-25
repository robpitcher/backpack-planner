import { test, expect } from '@playwright/test'
import { mockSupabaseAuth, mockSupabaseData } from './mocks/supabase'

test.describe('Create Trip Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page, true)
    await mockSupabaseData(page)
  })

  test('can create a trip from dashboard', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    await expect(page.getByText('Trips')).toBeVisible({ timeout: 10000 })

    await page.getByRole('button', { name: /create trip/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText(/create trip/i)).toBeVisible()

    await page.getByLabel(/title/i).fill('Test Trip')

    await page.getByRole('button', { name: /^create$/i }).click()

    await expect(page).toHaveURL(/\/trip\/.*\/plan/, { timeout: 10000 })
    await expect(page.getByText('Test Trip')).toBeVisible()
  })

  test('create trip dialog validates required fields', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: /create trip/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: /^create$/i }).click()

    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('can cancel trip creation', async ({ page }) => {
    await page.goto('/dashboard', { waitUntil: 'networkidle' })

    await page.getByRole('button', { name: /create trip/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible()

    await page.getByRole('button', { name: /cancel/i }).click()
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })
})
