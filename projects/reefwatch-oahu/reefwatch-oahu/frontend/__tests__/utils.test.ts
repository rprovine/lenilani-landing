/**
 * Tests for utility functions.
 */

import {
  cn,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  formatShortDate,
  formatTemperature,
  celsiusToFahrenheit,
  formatDHW,
  getDHWDescription,
  getRiskGradient,
  getRiskIcon,
  calculateBounds,
  getMarkerColor,
  getSiteTypeIcon,
  getDifficultyDisplay,
  getTrendArrow,
  debounce,
} from '@/lib/utils';

describe('cn - class name merge utility', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2');
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });
});

describe('Date formatting functions', () => {
  const testDate = '2024-06-15T10:30:00Z';

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const result = formatDate(testDate);
      expect(result).toMatch(/Jun 15, 2024/);
    });

    it('returns original string on invalid date', () => {
      expect(formatDate('invalid')).toBe('invalid');
    });
  });

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const result = formatDateTime(testDate);
      expect(result).toContain('Jun 15, 2024');
    });

    it('returns original string on invalid date', () => {
      expect(formatDateTime('invalid')).toBe('invalid');
    });
  });

  describe('formatRelativeTime', () => {
    it('returns relative time string', () => {
      const result = formatRelativeTime(testDate);
      expect(result).toContain('ago');
    });

    it('returns original string on invalid date', () => {
      expect(formatRelativeTime('invalid')).toBe('invalid');
    });
  });

  describe('formatShortDate', () => {
    it('formats short date correctly', () => {
      const result = formatShortDate(testDate);
      expect(result).toBe('Jun 15');
    });
  });
});

describe('Temperature formatting', () => {
  describe('formatTemperature', () => {
    it('formats Celsius correctly', () => {
      expect(formatTemperature(26.5)).toBe('26.5°C');
      expect(formatTemperature(26.5, 'C')).toBe('26.5°C');
    });

    it('converts and formats Fahrenheit correctly', () => {
      expect(formatTemperature(0, 'F')).toBe('32.0°F');
      expect(formatTemperature(100, 'F')).toBe('212.0°F');
    });

    it('returns N/A for null values', () => {
      expect(formatTemperature(null)).toBe('N/A');
    });
  });

  describe('celsiusToFahrenheit', () => {
    it('converts correctly', () => {
      expect(celsiusToFahrenheit(0)).toBe(32);
      expect(celsiusToFahrenheit(100)).toBe(212);
      expect(celsiusToFahrenheit(26)).toBeCloseTo(78.8);
    });
  });
});

describe('DHW formatting', () => {
  describe('formatDHW', () => {
    it('formats DHW correctly', () => {
      expect(formatDHW(2.5)).toBe('2.5 °C-weeks');
      expect(formatDHW(10.0)).toBe('10.0 °C-weeks');
    });

    it('returns N/A for null values', () => {
      expect(formatDHW(null)).toBe('N/A');
    });
  });

  describe('getDHWDescription', () => {
    it('returns correct description for low DHW', () => {
      expect(getDHWDescription(0)).toBe('Normal thermal conditions');
      expect(getDHWDescription(3.9)).toBe('Normal thermal conditions');
    });

    it('returns correct description for moderate DHW', () => {
      expect(getDHWDescription(4)).toBe('Elevated heat stress');
      expect(getDHWDescription(7)).toBe('Elevated heat stress');
    });

    it('returns correct description for high DHW', () => {
      expect(getDHWDescription(8)).toBe('Significant thermal stress');
      expect(getDHWDescription(11)).toBe('Significant thermal stress');
    });

    it('returns correct description for severe DHW', () => {
      expect(getDHWDescription(12)).toBe('Extreme heat stress');
      expect(getDHWDescription(20)).toBe('Extreme heat stress');
    });

    it('returns Unknown for null values', () => {
      expect(getDHWDescription(null)).toBe('Unknown');
    });
  });
});

describe('Risk utilities', () => {
  describe('getRiskGradient', () => {
    it('returns correct gradient for each risk score', () => {
      expect(getRiskGradient(0)).toContain('green');
      expect(getRiskGradient(1)).toContain('yellow');
      expect(getRiskGradient(2)).toContain('orange');
      expect(getRiskGradient(3)).toContain('red');
      expect(getRiskGradient(-1)).toContain('gray');
    });

    it('returns gray for unknown scores', () => {
      expect(getRiskGradient(99)).toContain('gray');
    });
  });

  describe('getRiskIcon', () => {
    it('returns correct icon for each risk score', () => {
      expect(getRiskIcon(0)).toBe('✅');
      expect(getRiskIcon(1)).toBe('⚠️');
      expect(getRiskIcon(2)).toBe('🔶');
      expect(getRiskIcon(3)).toBe('🔴');
      expect(getRiskIcon(-1)).toBe('❓');
    });
  });
});

describe('Map utilities', () => {
  describe('calculateBounds', () => {
    it('returns default Oahu bounds for empty array', () => {
      const bounds = calculateBounds([]);
      expect(bounds).toEqual([[-158.3, 21.2], [-157.6, 21.7]]);
    });

    it('calculates bounds correctly', () => {
      const coords = [
        { lat: 21.2, lon: -157.8 },
        { lat: 21.4, lon: -157.6 },
      ];
      const bounds = calculateBounds(coords);

      // Check structure
      expect(bounds.length).toBe(2);
      expect(bounds[0].length).toBe(2);
      expect(bounds[1].length).toBe(2);

      // Check that bounds contain the coordinates with padding
      expect(bounds[0][0]).toBeLessThan(-157.8);
      expect(bounds[1][0]).toBeGreaterThan(-157.6);
    });
  });

  describe('getMarkerColor', () => {
    it('returns correct color for each risk score', () => {
      expect(getMarkerColor(0)).toBe('#22c55e');
      expect(getMarkerColor(1)).toBe('#eab308');
      expect(getMarkerColor(2)).toBe('#f97316');
      expect(getMarkerColor(3)).toBe('#ef4444');
      expect(getMarkerColor(-1)).toBe('#6b7280');
    });
  });
});

describe('Site type utilities', () => {
  describe('getSiteTypeIcon', () => {
    it('returns correct icons for known types', () => {
      expect(getSiteTypeIcon('bay')).toBe('🏖️');
      expect(getSiteTypeIcon('beach')).toBe('🏝️');
      expect(getSiteTypeIcon('cove')).toBe('🪨');
      expect(getSiteTypeIcon('reef')).toBe('🐠');
      expect(getSiteTypeIcon('lagoon')).toBe('🌊');
      expect(getSiteTypeIcon('harbor')).toBe('⚓');
    });

    it('returns default icon for unknown types', () => {
      expect(getSiteTypeIcon('unknown')).toBe('📍');
    });
  });
});

describe('Difficulty display', () => {
  describe('getDifficultyDisplay', () => {
    it('returns correct display for each difficulty', () => {
      expect(getDifficultyDisplay('beginner')).toEqual({
        label: 'Beginner',
        color: 'text-green-600',
      });
      expect(getDifficultyDisplay('intermediate')).toEqual({
        label: 'Intermediate',
        color: 'text-yellow-600',
      });
      expect(getDifficultyDisplay('advanced')).toEqual({
        label: 'Advanced',
        color: 'text-red-600',
      });
      expect(getDifficultyDisplay('all_levels')).toEqual({
        label: 'All Levels',
        color: 'text-blue-600',
      });
    });

    it('returns default for unknown difficulty', () => {
      const result = getDifficultyDisplay('unknown');
      expect(result.label).toBe('unknown');
      expect(result.color).toBe('text-gray-600');
    });
  });
});

describe('Trend utilities', () => {
  describe('getTrendArrow', () => {
    it('returns correct arrows', () => {
      expect(getTrendArrow('rising')).toBe('↗️');
      expect(getTrendArrow('falling')).toBe('↘️');
      expect(getTrendArrow('stable')).toBe('➡️');
    });

    it('returns empty string for null', () => {
      expect(getTrendArrow(null)).toBe('');
    });

    it('returns empty string for unknown trend', () => {
      expect(getTrendArrow('unknown')).toBe('');
    });
  });
});

describe('debounce', () => {
  jest.useFakeTimers();

  it('delays function execution', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    expect(func).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });

  it('only executes once for rapid calls', () => {
    const func = jest.fn();
    const debouncedFunc = debounce(func, 100);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    jest.advanceTimersByTime(100);
    expect(func).toHaveBeenCalledTimes(1);
  });
});
