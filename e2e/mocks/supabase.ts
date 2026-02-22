import { Page } from '@playwright/test'

const MOCK_USER = {
  id: 'mock-user-id',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  role: 'authenticated',
}

const MOCK_SESSION = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  expires_in: 3600,
  token_type: 'bearer',
  user: MOCK_USER,
}

/**
 * Mock Supabase auth to simulate authenticated user session.
 * Intercepts auth API calls to bypass real authentication.
 */
export async function mockSupabaseAuth(page: Page, authenticated: boolean = true) {
  // Intercept ALL Supabase auth API calls
  await page.route('**/auth/v1/**', async (route) => {
    const url = route.request().url()

    // getSession() endpoint
    if (url.includes('/session')) {
      if (authenticated) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { session: MOCK_SESSION }, error: null }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { session: null }, error: null }),
        })
      }
    }
    // getUser() endpoint
    else if (url.includes('/user')) {
      if (authenticated) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { user: MOCK_USER }, error: null }),
        })
      } else {
        await route.fulfill({
          status: 401,
          contentType: 'application/json',
          body: JSON.stringify({ error: { message: 'Not authenticated' } }),
        })
      }
    }
    // token refresh
    else if (url.includes('/token')) {
      if (authenticated) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(MOCK_SESSION),
        })
      } else {
        await route.fulfill({ status: 401 })
      }
    }
    // default: allow other auth routes
    else {
      await route.continue()
    }
  })
}

/**
 * Mock Supabase data APIs (REST API and realtime).
 * Provides mock responses for trips, waypoints, routes, etc.
 */
export async function mockSupabaseData(page: Page) {
  // Mock REST API calls for users/profiles table
  await page.route('**/rest/v1/users**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '0-0/1' },
        body: JSON.stringify([
          {
            id: 'mock-user-id',
            email: 'test@example.com',
            preferred_units: 'imperial',
            created_at: '2024-01-01T00:00:00Z',
          },
        ]),
      })
    } else {
      await route.fulfill({ status: 200, body: '{}' })
    }
  })

  // Mock profiles table  
  await page.route('**/rest/v1/profiles**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '0-0/1' },
        body: JSON.stringify([
          {
            id: 'mock-user-id',
            email: 'test@example.com',
            preferred_units: 'imperial',
            created_at: '2024-01-01T00:00:00Z',
          },
        ]),
      })
    } else {
      await route.fulfill({ status: 200, body: '{}' })
    }
  })
  
  // Mock trips table
  await page.route('**/rest/v1/trips**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '0-0/0' },
        body: JSON.stringify([]),
      })
    } else if (method === 'POST') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-trip-id',
          ...body,
          user_id: 'mock-user-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })
    } else {
      await route.fulfill({ status: 200, body: '{}' })
    }
  })
  
  // Mock waypoints table
  await page.route('**/rest/v1/waypoints**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '0-0/0' },
        body: JSON.stringify([]),
      })
    } else if (method === 'POST') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-waypoint-id',
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })
    } else {
      await route.fulfill({ status: 200, body: '{}' })
    }
  })
  
  // Mock routes table
  await page.route('**/rest/v1/routes**', async (route) => {
    const method = route.request().method()
    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        headers: { 'Content-Range': '0-0/0' },
        body: JSON.stringify([]),
      })
    } else if (method === 'POST') {
      const body = route.request().postDataJSON()
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-route-id',
          ...body,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }),
      })
    } else {
      await route.fulfill({ status: 200, body: '{}' })
    }
  })

  // Mock days, gear_items, and other tables
  await page.route('**/rest/v1/days**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Content-Range': '0-0/0' },
      body: JSON.stringify([]),
    })
  })

  await page.route('**/rest/v1/gear_items**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: { 'Content-Range': '0-0/0' },
      body: JSON.stringify([]),
    })
  })

  // Mock realtime subscriptions (prevent errors)
  await page.route('**/realtime/v1/**', async (route) => {
    await route.fulfill({ status: 200, body: '{}' })
  })
}
