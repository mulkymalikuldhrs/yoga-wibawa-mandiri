import { describe, it, expect } from 'vitest';
import {
  SILO_CONSTANTS,
  calculateOpnameSilo,
  calculateFullOpname,
  calculateKekosongan,
  calculateDischargeOperation,
  calculateDischargeLoading,
  calculateSiloFillLevel,
  formatMT,
  formatHours,
} from '../silo-calculations';

describe('calculateOpnameSilo', () => {
  it('below 18m: cylinder empty + full cone empty', () => {
    const r = calculateOpnameSilo('A', [10, 10, 10, 10, 10, 10, 10]);
    expect(r.avgHeight).toBe(10);
    expect(r.isBelowLimit).toBe(true);
    expect(r.tCylinderEmpty).toBe(8);
    expect(r.tConisEmpty).toBe(SILO_CONSTANTS.SILO_A_CONIS_HEIGHT); // 4.6
    expect(r.volumeCylinderEmpty).toBeCloseTo(145.42 * 8, 2); // 1163.36
    expect(r.volumeConisEmpty).toBeCloseTo(48.47 * 4.6, 2); // 222.96
    expect(r.totalEmptyVolume).toBeCloseTo(1386.32, 1);
  });

  it('above 18m: no cylinder empty, partial cone only', () => {
    const r = calculateOpnameSilo('B', [20, 20, 20, 20, 20, 20, 20]);
    expect(r.isBelowLimit).toBe(false);
    expect(r.tCylinderEmpty).toBe(0);
    expect(r.tConisEmpty).toBeCloseTo(SILO_CONSTANTS.SILO_B_TOTAL_HEIGHT - 20, 2); // 0.9
    expect(r.totalEmptyVolume).toBeCloseTo(48.47 * 0.9, 1);
  });

  it('uses correct cone height per silo', () => {
    const a = calculateOpnameSilo('A', [5, 5, 5, 5, 5, 5, 5]);
    const b = calculateOpnameSilo('B', [5, 5, 5, 5, 5, 5, 5]);
    expect(a.tConisEmpty).toBe(4.6);
    expect(b.tConisEmpty).toBe(2.9);
    expect(b.totalEmptyVolume).toBeLessThan(a.totalEmptyVolume);
  });

  it('rejects wrong number of measurements', () => {
    expect(() => calculateOpnameSilo('A', [1, 2, 3])).toThrow(/Expected 7 measurements/);
    expect(() => calculateOpnameSilo('B', [])).toThrow();
  });
});

describe('calculateFullOpname', () => {
  it('cementFromShip = (totalAfter + pengeluaran) - totalBefore', () => {
    const res = calculateFullOpname(
      [12, 12, 12, 12, 12, 12, 12], // before A
      [11, 11, 11, 11, 11, 11, 11], // before B
      [14, 14, 14, 14, 14, 14, 14], // after A
      [13, 13, 13, 13, 13, 13, 13], // after B
      50,
    );
    const beforeA = calculateOpnameSilo('A', [12, 12, 12, 12, 12, 12, 12]).totalEmptyVolume;
    const beforeB = calculateOpnameSilo('B', [11, 11, 11, 11, 11, 11, 11]).totalEmptyVolume;
    const afterA = calculateOpnameSilo('A', [14, 14, 14, 14, 14, 14, 14]).totalEmptyVolume;
    const afterB = calculateOpnameSilo('B', [13, 13, 13, 13, 13, 13, 13]).totalEmptyVolume;
    const expected = (afterA + afterB + 50) - (beforeA + beforeB);
    expect(res.cementFromShip).toBeCloseTo(expected, 1);
    expect(res.pengeluaran).toBe(50);
  });

  it('deeper emptiness after + pengeluaran yields positive cementFromShip', () => {
    const res = calculateFullOpname(
      [16, 16, 16, 16, 16, 16, 16], // before: near-full cylinder
      [16, 16, 16, 16, 16, 16, 16],
      [10, 10, 10, 10, 10, 10, 10], // after: much more empty space
      [10, 10, 10, 10, 10, 10, 10],
      100,
    );
    const beforeV = calculateOpnameSilo('A', [16, 16, 16, 16, 16, 16, 16]).totalEmptyVolume;
    const afterV = calculateOpnameSilo('A', [10, 10, 10, 10, 10, 10, 10]).totalEmptyVolume;
    expect(res.cementFromShip).toBeCloseTo((afterV * 2 + 100) - (beforeV * 2), 1);
    expect(res.cementFromShip).toBeGreaterThan(0);
  });
});

describe('calculateKekosongan', () => {
  it('volume formula matches area x adjusted height', () => {
    const r = calculateKekosongan('A', [15, 15, 15, 15, 15, 15, 15], 100, 50, 200, '08:00');
    expect(r.avgHeight).toBe(15);
    expect(r.adjustedHeight2_5).toBe(12.5);
    expect(r.volume2_5).toBeCloseTo(145.42 * 12.5, 1); // 1817.75
    expect(r.volume2_0).toBeCloseTo(145.42 * 13, 1); // 1890.46
    expect(r.spaceSilo2_5).toBeCloseTo(1817.75 - 150, 1);
  });

  it('hours-to-fill uses discharge rate', () => {
    const r = calculateKekosongan('A', [15, 15, 15, 15, 15, 15, 15], 100, 50, 200, '08:00');
    const space = r.spaceSilo2_5;
    expect(r.hoursToFill2_5).toBeCloseTo(space / 200, 2);
  });

  it('clamps negative space to zero', () => {
    const r = calculateKekosongan('A', [1, 1, 1, 1, 1, 1, 1], 100, 50, 200, '08:00');
    expect(r.volume2_5).toBe(0);
    expect(r.spaceSilo2_5).toBe(0);
    expect(r.hoursToFill2_5).toBe(0);
  });

  it('guards division by zero rate', () => {
    const r = calculateKekosongan('A', [15, 15, 15, 15, 15, 15, 15], 0, 0, 0, '08:00');
    expect(r.hoursToFill2_5).toBe(0);
    expect(r.hoursToFill2_0).toBe(0);
  });

  it('adds decimal hours to clock time correctly', () => {
    // avg 15 -> space2_5 = 1667.75 MT at 200 MT/h = 8.33875 h from 08:00
    const r = calculateKekosongan('A', [15, 15, 15, 15, 15, 15, 15], 100, 50, 200, '08:00');
    expect(r.estimatedComplete2_5).toMatch(/^1[67]:\d{2}$/);
  });

  it('wraps past midnight', () => {
    const late = calculateKekosongan('A', [19, 19, 19, 19, 19, 19, 19], 0, 0, 1, '23:00');
    const hh = Number(late.estimatedComplete2_5.split(':')[0]);
    expect(hh).toBeGreaterThanOrEqual(0);
    expect(hh).toBeLessThan(23);
  });
});

describe('calculateDischargeOperation', () => {
  it('computes both rate bounds deterministically', () => {
    const r = calculateDischargeOperation('14:30', 600, 250, 300);
    expect(r.estimatedTimeMin).toBeCloseTo(2.4, 3); // 600/250
    expect(r.estimatedTimeMax).toBeCloseTo(2, 3); // 600/300
    expect(r.estimatedCompleteMin).toBe('16:54'); // 14:30 + 2.4h
    expect(r.estimatedCompleteMax).toBe('16:30');
  });

  it('zero rate does not produce Infinity or NaN', () => {
    const r = calculateDischargeOperation('08:00', 500, 0, 0);
    expect(Number.isFinite(r.estimatedTimeMin)).toBe(true);
    expect(Number.isFinite(r.estimatedTimeMax)).toBe(true);
  });
});

describe('calculateDischargeLoading', () => {
  it('balances cargo totals', () => {
    const r = calculateDischargeLoading(100, 900, 500, 30, 20);
    expect(r.totalCargoBalance).toBe(1400);
    expect(r.pengeluaranTruck).toBe(30);
    expect(r.pengeluaranCurah).toBe(20);
  });
});

describe('calculateSiloFillLevel', () => {
  it('status thresholds: >60 aman, >=30 sedang, else rendah (60 is sedang)', () => {
    expect(calculateSiloFillLevel('A', 6500, 10000).status).toBe('aman');
    expect(calculateSiloFillLevel('A', 4000, 10000).status).toBe('sedang');
    expect(calculateSiloFillLevel('A', 1000, 10000).status).toBe('rendah');
    expect(calculateSiloFillLevel('A', 6000, 10000).status).toBe('sedang'); // boundary: not > 60
    expect(calculateSiloFillLevel('A', 3000, 10000).status).toBe('sedang');
    expect(calculateSiloFillLevel('A', 2999, 10000).status).toBe('rendah');
  });

  it('fill percent and estimated height sane', () => {
    const r = calculateSiloFillLevel('A', 6500, 10000);
    expect(r.fillPercent).toBe(65);
    expect(r.estimatedHeight).toBeCloseTo(6500 / (145.42 * 1.2), 1);
  });

  it('handles zero capacity without NaN', () => {
    const r = calculateSiloFillLevel('A', 100, 0);
    expect(r.fillPercent).toBe(0);
    expect(Number.isFinite(r.estimatedHeight)).toBe(true);
  });
});

describe('formatters', () => {
  it('formatMT outputs Indonesian style with MT suffix', () => {
    const s = formatMT(1234.5);
    expect(s.endsWith('MT')).toBe(true);
    expect(s.replace(/\./g, '').replace(',', '.')).toContain('1234.50');
  });

  it('formatHours splits hours and minutes', () => {
    expect(formatHours(2.5)).toBe('2 jam 30 menit');
    expect(formatHours(0)).toBe('0 jam 0 menit');
  });
});
