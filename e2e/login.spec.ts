import { test, expect } from '@playwright/test'
import { mockSupabaseAuth, mockSupabaseData } from './mocks/supabase'

test.describe('Login Flow', () => {
  test('unauthenticated user is redirected to /login from protected routes', async ({ page }) => {
    await mockSupabaseAuth(page, false)
    await mockSupabaseData(page)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    await expect(page).toHaveURL('/login')

    await page.goto('/profile', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL('/login')
  })

  test('authenticated user can access /dashboard', async ({ page }) => {
    await mockSupabaseAuth(page, true)
    await mockSupabaseData(page)
    await page.goto('/dashboard', { waitUntil: 'networkidle' })
    
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText('Trips')).toBeVisible({ timeout: 10000 })
  })

  test('login page redirects authenticated user to /dashboard', async ({ page }) => {
    await mockSupabaseAuth(page, true)
    await mockSupabaseData(page)
    await page.goto('/login', { waitUntil: 'networkidle' })
    
    await expect(page).toHaveURL('/dashboard')
  })

  test('root path redirects to /dashboard', async ({ page }) => {
    await mockSupabaseAuth(page, true)
    await mockSupabaseData(page)
    await page.goto('/', { waitUntil: 'networkidle' })
    
    await expect(page).toHaveURL('/dashboard')
  })
})
