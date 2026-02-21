import { describe, it, expect } from 'vitest';
import {
  milesToKilometers,
  kilometersToMiles,
  feetToMeters,
  metersToFeet,
  ouncesToGrams,
  gramsToOunces,
  fahrenheitToCelsius,
  celsiusToFahrenheit,
  formatDistance,
  formatElevation,
  formatWeight,
  formatTemperature,
} from './units';

// ── Distance ───────────────────────────────────────────────

describe('milesToKilometers', () => {
  it('converts 1 mile', () => {
    expect(milesToKilometers(1)).toBeCloseTo(1.60934, 4);
  });

  it('converts 0', () => {
    expect(milesToKilometers(0)).toBe(0);
  });

  it('converts negative values', () => {
    expect(milesToKilometers(-5)).toBeCloseTo(-8.0467, 3);
  });

  it('converts large values', () => {
    expect(milesToKilometers(1000)).toBeCloseTo(1609.34, 1);
  });
});

describe('kilometersToMiles', () => {
  it('converts 1 kilometer', () => {
    expect(kilometersToMiles(1)).toBeCloseTo(0.62137, 4);
  });

  it('converts 0', () => {
    expect(kilometersToMiles(0)).toBe(0);
  });

  it('round-trip accuracy', () => {
    const original = 42.5;
    expect(kilometersToMiles(milesToKilometers(original))).toBeCloseTo(original, 10);
  });
});

// ── Elevation ──────────────────────────────────────────────

describe('feetToMeters', () => {
  it('converts 1 foot', () => {
    expect(feetToMeters(1)).toBeCloseTo(0.3048, 4);
  });

  it('converts 0', () => {
    expect(feetToMeters(0)).toBe(0);
  });

  it('converts negative values', () => {
    expect(feetToMeters(-100)).toBeCloseTo(-30.48, 2);
  });

  it('converts large values (Everest height)', () => {
    expect(feetToMeters(29032)).toBeCloseTo(8848.95, 0);
  });
});

describe('metersToFeet', () => {
  it('converts 1 meter', () => {
    expect(metersToFeet(1)).toBeCloseTo(3.28084, 4);
  });

  it('round-trip accuracy', () => {
    const original = 14505;
    expect(metersToFeet(feetToMeters(original))).toBeCloseTo(original, 10);
  });
});

// ── Weight ─────────────────────────────────────────────────

describe('ouncesToGrams', () => {
  it('converts 1 ounce', () => {
    expect(ouncesToGrams(1)).toBeCloseTo(28.3495, 3);
  });

  it('converts 0', () => {
    expect(ouncesToGrams(0)).toBe(0);
  });

  it('converts negative values', () => {
    expect(ouncesToGrams(-16)).toBeCloseTo(-453.592, 0);
  });

  it('converts large values', () => {
    expect(ouncesToGrams(1000)).toBeCloseTo(28349.5, 0);
  });
});

describe('gramsToOunces', () => {
  it('converts 1 gram', () => {
    expect(gramsToOunces(1)).toBeCloseTo(0.03527, 4);
  });

  it('round-trip accuracy', () => {
    const original = 32.5;
    expect(gramsToOunces(ouncesToGrams(original))).toBeCloseTo(original, 10);
  });
});

// ── Temperature ────────────────────────────────────────────

describe('fahrenheitToCelsius', () => {
  it('converts 32°F to 0°C (freezing)', () => {
    expect(fahrenheitToCelsius(32)).toBeCloseTo(0, 10);
  });

  it('converts 212°F to 100°C (boiling)', () => {
    expect(fahrenheitToCelsius(212)).toBeCloseTo(100, 10);
  });

  it('converts 0°F', () => {
    expect(fahrenheitToCelsius(0)).toBeCloseTo(-17.7778, 3);
  });

  it('converts negative values', () => {
    expect(fahrenheitToCelsius(-40)).toBeCloseTo(-40, 10);
  });
});

describe('celsiusToFahrenheit', () => {
  it('converts 0°C to 32°F', () => {
    expect(celsiusToFahrenheit(0)).toBeCloseTo(32, 10);
  });

  it('converts 100°C to 212°F', () => {
    expect(celsiusToFahrenheit(100)).toBeCloseTo(212, 10);
  });

  it('converts -40°C to -40°F (crossover point)', () => {
    expect(celsiusToFahrenheit(-40)).toBeCloseTo(-40, 10);
  });

  it('round-trip accuracy', () => {
    const original = 72;
    expect(celsiusToFahrenheit(fahrenheitToCelsius(original))).toBeCloseTo(original, 10);
  });
});

// ── Formatters ─────────────────────────────────────────────

describe('formatDistance', () => {
  it('formats imperial', () => {
    expect(formatDistance(12.4, 'imperial')).toBe('12.4 mi');
  });

  it('formats metric', () => {
    expect(formatDistance(12.4, 'metric')).toBe('20.0 km');
  });

  it('formats zero', () => {
    expect(formatDistance(0, 'imperial')).toBe('0.0 mi');
    expect(formatDistance(0, 'metric')).toBe('0.0 km');
  });
});

describe('formatElevation', () => {
  it('formats imperial', () => {
    expect(formatElevation(5280, 'imperial')).toBe('5280 ft');
  });

  it('formats metric', () => {
    expect(formatElevation(5280, 'metric')).toBe('1609 m');
  });

  it('formats zero', () => {
    expect(formatElevation(0, 'imperial')).toBe('0 ft');
    expect(formatElevation(0, 'metric')).toBe('0 m');
  });
});

describe('formatWeight', () => {
  it('formats imperial', () => {
    expect(formatWeight(16.0, 'imperial')).toBe('16.0 oz');
  });

  it('formats metric', () => {
    expect(formatWeight(16.0, 'metric')).toBe('453.6 g');
  });

  it('formats zero', () => {
    expect(formatWeight(0, 'imperial')).toBe('0.0 oz');
    expect(formatWeight(0, 'metric')).toBe('0.0 g');
  });
});

describe('formatTemperature', () => {
  it('formats imperial', () => {
    expect(formatTemperature(72.0, 'imperial')).toBe('72.0 °F');
  });

  it('formats metric', () => {
    expect(formatTemperature(72.0, 'metric')).toBe('22.2 °C');
  });

  it('formats freezing point', () => {
    expect(formatTemperature(32.0, 'imperial')).toBe('32.0 °F');
    expect(formatTemperature(32.0, 'metric')).toBe('0.0 °C');
  });
});
