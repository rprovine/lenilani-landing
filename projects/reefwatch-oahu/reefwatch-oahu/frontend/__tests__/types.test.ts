/**
 * Tests for type utility functions.
 */

import { getRiskColorClass, getRiskBorderClass } from '@/types';
import type { RiskLevel } from '@/types';

describe('getRiskColorClass', () => {
  it('returns correct class for Low risk', () => {
    expect(getRiskColorClass('Low')).toBe('bg-reef-low text-white');
  });

  it('returns correct class for Moderate risk', () => {
    expect(getRiskColorClass('Moderate')).toBe('bg-reef-moderate text-black');
  });

  it('returns correct class for High risk', () => {
    expect(getRiskColorClass('High')).toBe('bg-reef-high text-white');
  });

  it('returns correct class for Severe risk', () => {
    expect(getRiskColorClass('Severe')).toBe('bg-reef-severe text-white');
  });

  it('returns correct class for Unknown risk', () => {
    expect(getRiskColorClass('Unknown')).toBe('bg-reef-unknown text-white');
  });

  it('returns Unknown class for invalid risk level', () => {
    // Force an invalid value to test fallback
    expect(getRiskColorClass('Invalid' as RiskLevel)).toBe('bg-reef-unknown text-white');
  });
});

describe('getRiskBorderClass', () => {
  it('returns correct border class for Low risk', () => {
    expect(getRiskBorderClass('Low')).toBe('border-reef-low');
  });

  it('returns correct border class for Moderate risk', () => {
    expect(getRiskBorderClass('Moderate')).toBe('border-reef-moderate');
  });

  it('returns correct border class for High risk', () => {
    expect(getRiskBorderClass('High')).toBe('border-reef-high');
  });

  it('returns correct border class for Severe risk', () => {
    expect(getRiskBorderClass('Severe')).toBe('border-reef-severe');
  });

  it('returns correct border class for Unknown risk', () => {
    expect(getRiskBorderClass('Unknown')).toBe('border-reef-unknown');
  });

  it('returns Unknown border class for invalid risk level', () => {
    expect(getRiskBorderClass('Invalid' as RiskLevel)).toBe('border-reef-unknown');
  });
});
