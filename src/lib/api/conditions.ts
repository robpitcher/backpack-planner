// NWS Weather Forecast API client
// Flow: GET /points/{lat},{lng} → get forecast URL → GET forecast
// Caches results for 6 hours.

export interface ForecastDay {
  name: string // e.g. "Monday", "Monday Night"
  date: string // ISO date
  isDaytime: boolean
  temperatureHigh: number | null // °F
  temperatureLow: number | null // °F
  shortForecast: string
  detailedForecast: string
  precipitationChance: number | null // %
  icon: WeatherIcon
}

export type WeatherIcon =
  | 'sun'
  | 'cloud'
  | 'cloud-sun'
  | 'cloud-rain'
  | 'cloud-snow'
  | 'cloud-lightning'
  | 'cloud-fog'
  | 'wind'

export interface WeatherForecast {
  days: ForecastDay[]
  fetchedAt: string // ISO timestamp
  locationName: string
}

interface CachedForecast {
  forecast: WeatherForecast
  expiresAt: number // unix ms
}

const CACHE_DURATION_MS = 6 * 60 * 60 * 1000 // 6 hours
const cache = new Map<string, CachedForecast>()

function cacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`
}

function mapShortForecastToIcon(short: string): WeatherIcon {
  const s = short.toLowerCase()
  if (s.includes('thunder') || s.includes('lightning')) return 'cloud-lightning'
  if (s.includes('snow') || s.includes('sleet') || s.includes('ice'))
    return 'cloud-snow'
  if (s.includes('rain') || s.includes('shower') || s.includes('drizzle'))
    return 'cloud-rain'
  if (s.includes('fog') || s.includes('haze') || s.includes('mist'))
    return 'cloud-fog'
  if (s.includes('wind')) return 'wind'
  if (s.includes('partly') || s.includes('mostly cloudy')) return 'cloud-sun'
  if (s.includes('cloud') || s.includes('overcast')) return 'cloud'
  return 'sun'
}

function parsePrecipChance(
  period: { probabilityOfPrecipitation?: { value: number | null } },
): number | null {
  return period.probabilityOfPrecipitation?.value ?? null
}

/**
 * Pair NWS day/night periods into single forecast days
 * with high (daytime) and low (nighttime) temps.
 */
function pairPeriods(
  periods: Array<{
    name: string
    startPeriod: string
    isDaytime: boolean
    temperature: number
    shortForecast: string
    detailedForecast: string
    probabilityOfPrecipitation?: { value: number | null }
  }>,
): ForecastDay[] {
  const days: ForecastDay[] = []
  let i = 0

  while (i < periods.length && days.length < 7) {
    const p = periods[i]
    const dateStr = p.startPeriod.slice(0, 10)

    if (p.isDaytime) {
      // Look for matching night period
      const night = i + 1 < periods.length && !periods[i + 1].isDaytime
        ? periods[i + 1]
        : null

      days.push({
        name: p.name,
        date: dateStr,
        isDaytime: true,
        temperatureHigh: p.temperature,
        temperatureLow: night ? night.temperature : null,
        shortForecast: p.shortForecast,
        detailedForecast: p.detailedForecast,
        precipitationChance: parsePrecipChance(p) ?? (night ? parsePrecipChance(night) : null),
        icon: mapShortForecastToIcon(p.shortForecast),
      })

      i += night ? 2 : 1
    } else {
      // Night period without a preceding day (first period is tonight)
      days.push({
        name: p.name,
        date: dateStr,
        isDaytime: false,
        temperatureHigh: null,
        temperatureLow: p.temperature,
        shortForecast: p.shortForecast,
        detailedForecast: p.detailedForecast,
        precipitationChance: parsePrecipChance(p),
        icon: mapShortForecastToIcon(p.shortForecast),
      })
      i += 1
    }
  }

  return days
}

export async function fetchWeatherForecast(
  lat: number,
  lng: number,
): Promise<{ data: WeatherForecast | null; error: string | null }> {
  const key = cacheKey(lat, lng)

  // Check cache
  const cached = cache.get(key)
  if (cached && Date.now() < cached.expiresAt) {
    return { data: cached.forecast, error: null }
  }

  try {
    // Step 1: Get the forecast URL from the points endpoint
    const pointsRes = await fetch(
      `https://api.weather.gov/points/${lat.toFixed(4)},${lng.toFixed(4)}`,
      { headers: { 'User-Agent': 'TrailForge/1.0 (backpack-planner)' } },
    )

    if (!pointsRes.ok) {
      if (pointsRes.status === 404) {
        return {
          data: null,
          error: 'Location not supported by NWS (US locations only)',
        }
      }
      if (pointsRes.status === 429) {
        return { data: null, error: 'Rate limited — try again in a few minutes' }
      }
      return { data: null, error: `NWS API error (${pointsRes.status})` }
    }

    const pointsData = await pointsRes.json()
    const forecastUrl = pointsData.properties?.forecast as string | undefined
    const locationName = (pointsData.properties?.relativeLocation?.properties?.city ?? '') +
      (pointsData.properties?.relativeLocation?.properties?.state
        ? `, ${pointsData.properties.relativeLocation.properties.state}`
        : '')

    if (!forecastUrl) {
      return { data: null, error: 'Could not resolve forecast URL' }
    }

    // Step 2: Fetch the actual forecast
    const forecastRes = await fetch(forecastUrl, {
      headers: { 'User-Agent': 'TrailForge/1.0 (backpack-planner)' },
    })

    if (!forecastRes.ok) {
      return { data: null, error: `Forecast fetch failed (${forecastRes.status})` }
    }

    const forecastData = await forecastRes.json()
    const periods = (forecastData.properties?.periods ?? []).map(
      (p: Record<string, unknown>) => ({
        name: p.name as string,
        startPeriod: p.startTime as string,
        isDaytime: p.isDaytime as boolean,
        temperature: p.temperature as number,
        shortForecast: p.shortForecast as string,
        detailedForecast: p.detailedForecast as string,
        probabilityOfPrecipitation: p.probabilityOfPrecipitation as {
          value: number | null
        } | undefined,
      }),
    )

    const days = pairPeriods(periods)
    const forecast: WeatherForecast = {
      days,
      fetchedAt: new Date().toISOString(),
      locationName: locationName || 'Unknown location',
    }

    // Cache it
    cache.set(key, {
      forecast,
      expiresAt: Date.now() + CACHE_DURATION_MS,
    })

    return { data: forecast, error: null }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch weather data'
    return { data: null, error: message }
  }
}
