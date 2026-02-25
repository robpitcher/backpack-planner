import { test, expect } from '@playwright/test'
import { mockSupabaseAuth, mockSupabaseData } from './mocks/supabase'

test.describe('Draw Route Flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockSupabaseAuth(page, true)
    await mockSupabaseData(page)

    await page.route('**/rest/v1/trips**', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          headers: { 'Content-Range': '0-0/1' },
          body: JSON.stringify([
            {
              id: 'test-trip-id',
              user_id: 'mock-user-id',
              title: 'Test Trip',
              description: null,
              start_date: null,
              end_date: null,
              status: 'draft',
              is_public: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ]),
        })
      } else {
        await route.continue()
      }
    })
  })

  test('map view is visible on trip planner page', async ({ page }) => {
    await page.goto('/trip/test-trip-id/plan', { waitUntil: 'networkidle' })
    
    await expect(page.getByText('Test Trip')).toBeVisible({ timeout: 10000 })
    
    const mapContainer = page.locator('.maplibregl-map, [class*="map-container"], canvas')
    await expect(mapContainer.first()).toBeVisible({ timeout: 10000 })
  })

  test('can navigate between tabs in trip planner', async ({ page }) => {
    await page.goto('/trip/test-trip-id/plan', { waitUntil: 'networkidle' })

    await expect(page.getByRole('tab', { name: /waypoints/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('tab', { name: /gear/i })).toBeVisible()
    await expect(page.getByRole('tab', { name: /itinerary/i })).toBeVisible()

    await page.getByRole('tab', { name: /gear/i }).click()
    await expect(page.getByText(/no gear items yet/i)).toBeVisible()

    await page.getByRole('tab', { name: /waypoints/i }).click()
    await expect(page.getByText(/no waypoints yet/i)).toBeVisible()
  })
})
