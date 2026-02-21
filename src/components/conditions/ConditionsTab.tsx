import { useEffect, useState, useCallback } from 'react'
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Wind,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Thermometer,
  Droplets,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  fetchWeatherForecast,
  type WeatherForecast,
  type ForecastDay,
  type WeatherIcon,
} from '@/lib/api/conditions'
import { useAuthStore } from '@/stores/authStore'
import { useTripStore } from '@/stores/tripStore'
import { formatTemperature } from '@/utils/units'

interface ConditionsTabProps {
  tripId: string
  startDate: string | null
  endDate: string | null
}

const WEATHER_ICONS: Record<WeatherIcon, React.ComponentType<{ className?: string }>> = {
  sun: Sun,
  cloud: Cloud,
  'cloud-sun': CloudSun,
  'cloud-rain': CloudRain,
  'cloud-snow': CloudSnow,
  'cloud-lightning': CloudLightning,
  'cloud-fog': CloudFog,
  wind: Wind,
}

function isDateInRange(date: string, start: string | null, end: string | null): boolean {
  if (!start) return false
  const d = date.slice(0, 10)
  const s = start.slice(0, 10)
  const e = end ? end.slice(0, 10) : s
  return d >= s && d <= e
}

export default function ConditionsTab({ tripId: _tripId, startDate, endDate }: ConditionsTabProps) {
  const [forecast, setForecast] = useState<WeatherForecast | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const preferredUnits = useAuthStore((s) => s.preferredUnits)
  const waypoints = useTripStore((s) => s.waypoints)

  // Use first waypoint's coordinates as the forecast location
  const forecastLocation = waypoints.length > 0
    ? { lat: waypoints[0].lat, lng: waypoints[0].lng }
    : null

  const loadForecast = useCallback(async () => {
    if (!forecastLocation) {
      setError('Add a waypoint to see weather conditions')
      return
    }
    setLoading(true)
    setError(null)

    const result = await fetchWeatherForecast(
      forecastLocation.lat,
      forecastLocation.lng,
    )

    if (result.error) {
      setError(result.error)
      setForecast(null)
    } else {
      setForecast(result.data)
    }
    setLoading(false)
  }, [forecastLocation])

  useEffect(() => {
    loadForecast()
  }, [loadForecast])

  if (loading && !forecast) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm">Loading weather forecast…</p>
      </div>
    )
  }

  if (error && !forecast) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-muted-foreground">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="text-sm text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={() => loadForecast()}>
          Retry
        </Button>
      </div>
    )
  }

  if (!forecast) return null

  return (
    <div className="flex flex-col gap-3 overflow-y-auto p-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {forecast.locationName}
          </h3>
          <p className="text-xs text-muted-foreground">
            Updated{' '}
            {new Date(forecast.fetchedAt).toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => loadForecast()}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* Forecast cards */}
      <div className="space-y-2">
        {forecast.days.map((day, i) => (
          <ForecastCard
            key={i}
            day={day}
            units={preferredUnits}
            isTrip={isDateInRange(day.date, startDate, endDate)}
          />
        ))}
      </div>
    </div>
  )
}

function ForecastCard({
  day,
  units,
  isTrip,
}: {
  day: ForecastDay
  units: 'imperial' | 'metric'
  isTrip: boolean
}) {
  const IconComponent = WEATHER_ICONS[day.icon] ?? Cloud
  const dateLabel = new Date(day.date + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <div
      className={`rounded-lg border p-3 ${
        isTrip
          ? 'border-orange-200 bg-orange-50'
          : 'border bg-card'
      }`}
    >
      <div className="flex items-start gap-3">
        <IconComponent className="mt-0.5 h-8 w-8 shrink-0 text-muted-foreground" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {day.name}
                {isTrip && (
                  <span className="ml-2 rounded bg-orange-200 px-1.5 py-0.5 text-xs text-orange-800">
                    Trip
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">{dateLabel}</p>
            </div>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">{day.shortForecast}</p>

          <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {day.temperatureHigh != null && (
                <span className="font-medium text-red-600">
                  {formatTemperature(day.temperatureHigh, units)}
                </span>
              )}
              {day.temperatureHigh != null && day.temperatureLow != null && ' / '}
              {day.temperatureLow != null && (
                <span className="font-medium text-blue-600">
                  {formatTemperature(day.temperatureLow, units)}
                </span>
              )}
            </span>
            {day.precipitationChance != null && (
              <span className="flex items-center gap-1">
                <Droplets className="h-3 w-3" />
                {day.precipitationChance}%
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
