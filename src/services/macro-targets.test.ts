import { describe, it, expect } from 'vitest';
import { getAllTargets, upsertTarget } from './macro-targets';

describe('macro-targets', () => {
  it('auto-creates training and rest defaults', () => {
    const targets = getAllTargets();
    expect(targets).toHaveLength(2);
    expect(targets.map((t) => t.profileType).sort()).toEqual(['rest', 'training']);
    expect(targets[0].calories).toBe(0);
  });

  it('returns existing targets without creating duplicates', () => {
    getAllTargets();
    const targets = getAllTargets();
    expect(targets).toHaveLength(2);
  });

  it('upsert creates then updates', () => {
    const created = upsertTarget('training', { calories: 2500, protein: 180, carbs: 300, fat: 80 });
    expect(created.calories).toBe(2500);

    const updated = upsertTarget('training', { calories: 2800, protein: 200, carbs: 320, fat: 90 });
    expect(updated.id).toBe(created.id);
    expect(updated.calories).toBe(2800);
  });
});
