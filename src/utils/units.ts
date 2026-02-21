import type { UnitSystem } from '@/types';

// ── Conversion Constants ───────────────────────────────────

const MILES_TO_KM = 1.60934;
const FEET_TO_METERS = 0.3048;
const OZ_TO_GRAMS = 28.3495;

// ── Distance: miles ↔ kilometers ───────────────────────────

export function milesToKilometers(miles: number): number {
  return miles * MILES_TO_KM;
}

export function kilometersToMiles(km: number): number {
  return km / MILES_TO_KM;
}

// ── Elevation: feet ↔ meters ───────────────────────────────

export function feetToMeters(feet: number): number {
  return feet * FEET_TO_METERS;
}

export function metersToFeet(meters: number): number {
  return meters / FEET_TO_METERS;
}

// ── Weight: ounces ↔ grams ─────────────────────────────────

export function ouncesToGrams(oz: number): number {
  return oz * OZ_TO_GRAMS;
}

export function gramsToOunces(grams: number): number {
  return grams / OZ_TO_GRAMS;
}

// ── Temperature: °F ↔ °C ──────────────────────────────────

export function fahrenheitToCelsius(f: number): number {
  return ((f - 32) * 5) / 9;
}

export function celsiusToFahrenheit(c: number): number {
  return (c * 9) / 5 + 32;
}

// ── Formatters ─────────────────────────────────────────────

export function formatDistance(miles: number, system: UnitSystem): string {
  if (system === 'metric') {
    return `${milesToKilometers(miles).toFixed(1)} km`;
  }
  return `${miles.toFixed(1)} mi`;
}

export function formatElevation(feet: number, system: UnitSystem): string {
  if (system === 'metric') {
    return `${Math.round(feetToMeters(feet))} m`;
  }
  return `${Math.round(feet)} ft`;
}

export function formatWeight(oz: number, system: UnitSystem): string {
  if (system === 'metric') {
    return `${ouncesToGrams(oz).toFixed(1)} g`;
  }
  return `${oz.toFixed(1)} oz`;
}

export function formatTemperature(f: number, system: UnitSystem): string {
  if (system === 'metric') {
    return `${fahrenheitToCelsius(f).toFixed(1)} °C`;
  }
  return `${f.toFixed(1)} °F`;
}
