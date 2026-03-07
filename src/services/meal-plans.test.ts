import { describe, it, expect } from 'vitest';
import { getOrCreateWeekPlan } from './meal-plans';

describe('meal-plans', () => {
  it('creates a plan on first call', () => {
    const plan = getOrCreateWeekPlan('2025-01-06');
    expect(plan.weekStart).toBe('2025-01-06');
    expect(plan.id).toBeGreaterThan(0);
    expect(plan.entries).toEqual([]);
  });

  it('returns existing plan on second call', () => {
    const plan1 = getOrCreateWeekPlan('2025-01-06');
    const plan2 = getOrCreateWeekPlan('2025-01-06');
    expect(plan2.id).toBe(plan1.id);
  });
});
