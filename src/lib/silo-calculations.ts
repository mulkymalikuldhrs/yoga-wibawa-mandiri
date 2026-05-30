// ============================================================
// Silo Calculation Engine — YWM AI Dashboard
// PT. Yoga Wibawa Mandiri
// Based on actual Excel formulas from:
//   - Opname Silo (Complete)-1.xlsx
//   - Kalkulasi Kekosongan Silo.xlsx
//   - Discharge Calculation Kalkulasi Kekosongan.xlsx
//   - Operasi_Pembongkaran.xlsx
// ============================================================

// ── Physical Constants ──
export const SILO_CONSTANTS = {
  CYLINDER_CROSS_SECTION: 145.42, // m²
  CONIS_VOLUME_FACTOR: 48.47,     // m³/m (conis reference volume)
  SILO_A_CONIS_HEIGHT: 4.6,       // m (full cone height below 18m)
  SILO_B_CONIS_HEIGHT: 2.9,       // m (full cone height below 18m)
  SILO_A_TOTAL_HEIGHT: 22.6,      // m (cylinder + cone)
  SILO_B_TOTAL_HEIGHT: 20.9,      // m (cylinder + cone)
  CYLINDER_HEIGHT_LIMIT: 18.0,    // m (cylinder section max height)
  NUM_MEASUREMENT_POINTS: 7,      // number of measurement holes
  KEEKOSONGAN_AREA: 145.42,       // m² (simplified area for kekosongan calc)
  ADJUSTMENT_LEVELS: [2.5, 2.0],  // m (standard adjustment levels)
} as const;

// ── Types ──
export interface SiloMeasurement {
  silo: 'A' | 'B';
  measurements: number[]; // 7 height measurements in meters
  timestamp: string;
}

export interface OpnameCalculation {
  silo: 'A' | 'B';
  avgHeight: number;
  tCylinderEmpty: number;
  tConisEmpty: number;
  volumeCylinderEmpty: number;  // MT
  volumeConisEmpty: number;     // MT
  totalEmptyVolume: number;     // MT
  isBelowLimit: boolean;        // avg height ≤ 18m
}

export interface OpnameResult {
  before: {
    siloA: OpnameCalculation;
    siloB: OpnameCalculation;
    totalEmptySpace: number; // MT
  };
  after: {
    siloA: OpnameCalculation;
    siloB: OpnameCalculation;
    totalEmptySpace: number; // MT
  };
  pengeluaran: number; // MT (cement removed from silos between opname I & II)
  cementFromShip: number; // MT (net cement discharged from ship)
}

export interface KekosonganResult {
  silo: 'A' | 'B';
  totalHeights: number;
  avgHeight: number;
  adjustedHeight2_5: number;
  adjustedHeight2_0: number;
  volume2_5: number;        // MT
  volume2_0: number;        // MT
  spaceSilo2_5: number;     // MT (after subtracting pengeluaran)
  spaceSilo2_0: number;     // MT
  hoursToFill2_5: number;
  hoursToFill2_0: number;
  estimatedComplete2_5: string; // HH:MM WIB
  estimatedComplete2_0: string; // HH:MM WIB
}

export interface DischargeOperation {
  startTime: string;        // HH:MM WIB
  rateMin: number;          // tons/hour
  rateMax: number;          // tons/hour
  remainingCargo: number;   // MT
  estimatedTimeMin: number; // hours
  estimatedTimeMax: number; // hours
  estimatedCompleteMin: string; // HH:MM WIB
  estimatedCompleteMax: string; // HH:MM WIB
}

export interface DischargeLoading {
  cargoDischargePCC: number;       // MT (current discharge)
  totalCargoDischargePCC: number;  // MT (total discharged so far)
  balanceCargoDischargePCC: number; // MT (remaining)
  totalCargoBalance: number;       // MT
  pengeluaranTruck: number;        // MT
  pengeluaranCurah: number;        // MT
  dischargeStartedA?: string;      // HH:MM WIB
  dischargeStartedB?: string;      // HH:MM WIB
}

// ══════════════════════════════════════════════════════════
// OPNAME CALCULATION (from Opname Silo Complete)
// ══════════════════════════════════════════════════════════

/**
 * Calculate opname for a single silo based on 7 height measurements.
 * 
 * Logic:
 * 1. avg_height = AVERAGE(measurements_1_to_7)
 * 2. If avg_height ≤ 18m (cylinder height limit):
 *    - t_cylinder_empty = 18 - avg_height
 *    - t_conis = full reference height (4.6 for A, 2.9 for B)
 * 3. If avg_height > 18m:
 *    - t_cylinder_empty = 0 (Nihil)
 *    - t_conis = total_height - avg_height (22.6-avg for A, 20.9-avg for B)
 * 4. empty_volume = (145.42 × t_cylinder_empty) + (48.47 × t_conis)
 */
export function calculateOpnameSilo(
  silo: 'A' | 'B',
  measurements: number[]
): OpnameCalculation {
  if (measurements.length !== SILO_CONSTANTS.NUM_MEASUREMENT_POINTS) {
    throw new Error(`Expected ${SILO_CONSTANTS.NUM_MEASUREMENT_POINTS} measurements, got ${measurements.length}`);
  }

  const avgHeight = measurements.reduce((sum, h) => sum + h, 0) / measurements.length;
  const isBelowLimit = avgHeight <= SILO_CONSTANTS.CYLINDER_HEIGHT_LIMIT;

  let tCylinderEmpty: number;
  let tConisEmpty: number;

  if (isBelowLimit) {
    // Below 18m: cylinder has empty space, full cone is empty
    tCylinderEmpty = SILO_CONSTANTS.CYLINDER_HEIGHT_LIMIT - avgHeight;
    tConisEmpty = silo === 'A' 
      ? SILO_CONSTANTS.SILO_A_CONIS_HEIGHT 
      : SILO_CONSTANTS.SILO_B_CONIS_HEIGHT;
  } else {
    // Above 18m: no cylinder empty space, partial cone is empty
    tCylinderEmpty = 0;
    tConisEmpty = silo === 'A'
      ? SILO_CONSTANTS.SILO_A_TOTAL_HEIGHT - avgHeight
      : SILO_CONSTANTS.SILO_B_TOTAL_HEIGHT - avgHeight;
  }

  const volumeCylinderEmpty = SILO_CONSTANTS.CYLINDER_CROSS_SECTION * tCylinderEmpty;
  const volumeConisEmpty = SILO_CONSTANTS.CONIS_VOLUME_FACTOR * tConisEmpty;
  const totalEmptyVolume = volumeCylinderEmpty + volumeConisEmpty;

  return {
    silo,
    avgHeight: round2(avgHeight),
    tCylinderEmpty: round2(tCylinderEmpty),
    tConisEmpty: round2(Math.max(0, tConisEmpty)),
    volumeCylinderEmpty: round2(volumeCylinderEmpty),
    volumeConisEmpty: round2(volumeConisEmpty),
    totalEmptyVolume: round2(totalEmptyVolume),
    isBelowLimit,
  };
}

/**
 * Calculate complete opname result comparing before and after discharge.
 * 
 * cement_from_ship = (total_empty_AFTER + pengeluaran) - total_empty_BEFORE
 */
export function calculateFullOpname(
  beforeMeasurementsA: number[],
  beforeMeasurementsB: number[],
  afterMeasurementsA: number[],
  afterMeasurementsB: number[],
  pengeluaran: number // MT removed from silos between measurements
): OpnameResult {
  const siloABefore = calculateOpnameSilo('A', beforeMeasurementsA);
  const siloBBefore = calculateOpnameSilo('B', beforeMeasurementsB);
  const siloAAfter = calculateOpnameSilo('A', afterMeasurementsA);
  const siloBAfter = calculateOpnameSilo('B', afterMeasurementsB);

  const totalEmptyBefore = siloABefore.totalEmptyVolume + siloBBefore.totalEmptyVolume;
  const totalEmptyAfter = siloAAfter.totalEmptyVolume + siloBAfter.totalEmptyVolume;

  const cementFromShip = (totalEmptyAfter + pengeluaran) - totalEmptyBefore;

  return {
    before: {
      siloA: siloABefore,
      siloB: siloBBefore,
      totalEmptySpace: round2(totalEmptyBefore),
    },
    after: {
      siloA: siloAAfter,
      siloB: siloBAfter,
      totalEmptySpace: round2(totalEmptyAfter),
    },
    pengeluaran,
    cementFromShip: round2(cementFromShip),
  };
}

// ══════════════════════════════════════════════════════════
// KEKOSONGAN CALCULATION (from Kalkulasi Kekosongan & Discharge)
// ══════════════════════════════════════════════════════════

/**
 * Calculate silo emptiness with discharge rate estimation.
 * 
 * Logic:
 * 1. total_heights = SUM(measurements)
 * 2. avg_height = total_heights / 7
 * 3. adjusted_height_2.5 = avg_height - 2.5
 * 4. adjusted_height_2.0 = avg_height - 2.0
 * 5. volume = adjusted_height × 145.42
 * 6. space_silo = volume - pengeluaran_truck - pengeluaran_curah
 * 7. hours_to_fill = space_silo / discharge_rate
 * 8. est_completion = start_time + hours_to_fill
 */
export function calculateKekosongan(
  silo: 'A' | 'B',
  measurements: number[],
  pengeluaranTruck: number,
  pengeluaranCurah: number,
  dischargeRate: number, // MT/hour
  startTime: string, // HH:MM format
): KekosonganResult {
  const totalHeights = measurements.reduce((sum, h) => sum + h, 0);
  const avgHeight = totalHeights / SILO_CONSTANTS.NUM_MEASUREMENT_POINTS;
  const adjustedHeight2_5 = avgHeight - 2.5;
  const adjustedHeight2_0 = avgHeight - 2.0;

  // Use 145.42 for accuracy (not 145 as in the simplified Excel)
  const area = SILO_CONSTANTS.KEEKOSONGAN_AREA;

  const volume2_5 = Math.max(0, adjustedHeight2_5 * area);
  const volume2_0 = Math.max(0, adjustedHeight2_0 * area);

  const spaceSilo2_5 = Math.max(0, volume2_5 - pengeluaranTruck - pengeluaranCurah);
  const spaceSilo2_0 = Math.max(0, volume2_0 - pengeluaranTruck - pengeluaranCurah);

  const hoursToFill2_5 = dischargeRate > 0 ? spaceSilo2_5 / dischargeRate : 0;
  const hoursToFill2_0 = dischargeRate > 0 ? spaceSilo2_0 / dischargeRate : 0;

  return {
    silo,
    totalHeights: round2(totalHeights),
    avgHeight: round2(avgHeight),
    adjustedHeight2_5: round2(adjustedHeight2_5),
    adjustedHeight2_0: round2(adjustedHeight2_0),
    volume2_5: round2(volume2_5),
    volume2_0: round2(volume2_0),
    spaceSilo2_5: round2(spaceSilo2_5),
    spaceSilo2_0: round2(spaceSilo2_0),
    hoursToFill2_5: round3(hoursToFill2_5),
    hoursToFill2_0: round3(hoursToFill2_0),
    estimatedComplete2_5: addHoursToTime(startTime, hoursToFill2_5),
    estimatedComplete2_0: addHoursToTime(startTime, hoursToFill2_0),
  };
}

// ══════════════════════════════════════════════════════════
// DISCHARGE OPERATION CALCULATION (from Operasi_Pembongkaran)
// ══════════════════════════════════════════════════════════

/**
 * Calculate discharge operation estimates.
 * 
 * est_time = remaining_cargo / rate
 * est_complete = start_time + est_time
 */
export function calculateDischargeOperation(
  startTime: string,
  remainingCargo: number,
  rateMin: number,
  rateMax: number,
): DischargeOperation {
  const estimatedTimeMin = rateMin > 0 ? remainingCargo / rateMin : 0;
  const estimatedTimeMax = rateMax > 0 ? remainingCargo / rateMax : 0;

  return {
    startTime,
    rateMin,
    rateMax,
    remainingCargo: round2(remainingCargo),
    estimatedTimeMin: round3(estimatedTimeMin),
    estimatedTimeMax: round3(estimatedTimeMax),
    estimatedCompleteMin: addHoursToTime(startTime, estimatedTimeMin),
    estimatedCompleteMax: addHoursToTime(startTime, estimatedTimeMax),
  };
}

// ══════════════════════════════════════════════════════════
// DISCHARGE LOADING CALCULATION (from Discharge Calculation)
// ══════════════════════════════════════════════════════════

/**
 * Calculate discharge loading with cargo tracking.
 */
export function calculateDischargeLoading(
  cargoDischargePCC: number,
  totalCargoDischargePCC: number,
  balanceCargoDischargePCC: number,
  pengeluaranTruck: number,
  pengeluaranCurah: number,
): DischargeLoading {
  return {
    cargoDischargePCC: round2(cargoDischargePCC),
    totalCargoDischargePCC: round2(totalCargoDischargePCC),
    balanceCargoDischargePCC: round2(balanceCargoDischargePCC),
    totalCargoBalance: round2(totalCargoDischargePCC + balanceCargoDischargePCC),
    pengeluaranTruck: round2(pengeluaranTruck),
    pengeluaranCurah: round2(pengeluaranCurah),
  };
}

// ══════════════════════════════════════════════════════════
// SILO FILL LEVEL CALCULATION
// ══════════════════════════════════════════════════════════

/**
 * Calculate silo fill percentage from current weight.
 * Uses the opname formulas to estimate fill level.
 */
export function calculateSiloFillLevel(
  silo: 'A' | 'B',
  currentWeight: number, // MT (metric tons of cement in silo)
  capacity: number, // MT (max capacity)
): {
  fillPercent: number;
  estimatedHeight: number;
  status: 'aman' | 'sedang' | 'rendah';
  color: string;
} {
  const fillPercent = capacity > 0 ? (currentWeight / capacity) * 100 : 0;

  // Estimate height from weight using inverse calculation
  // Approximate: height ≈ weight / (145.42 × bulk_density_factor)
  // Using bulk density of ~1.2 MT/m³ for cement
  const bulkDensity = 1.2;
  const estimatedHeight = (currentWeight / (SILO_CONSTANTS.CYLINDER_CROSS_SECTION * bulkDensity));

  let status: 'aman' | 'sedang' | 'rendah';
  let color: string;

  if (fillPercent > 60) {
    status = 'aman';
    color = '#22c55e';
  } else if (fillPercent >= 30) {
    status = 'sedang';
    color = '#eab308';
  } else {
    status = 'rendah';
    color = '#ef4444';
  }

  return {
    fillPercent: round2(fillPercent),
    estimatedHeight: round2(estimatedHeight),
    status,
    color,
  };
}

// ══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ══════════════════════════════════════════════════════════

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/**
 * Add decimal hours to a time string (HH:MM format) and return new time.
 */
function addHoursToTime(timeStr: string, hours: number): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return '--:--';
    
    const totalMinutes = h * 60 + m + hours * 60;
    const newH = Math.floor(totalMinutes / 60) % 24;
    const newM = Math.round(totalMinutes % 60);
    
    return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
  } catch {
    return '--:--';
  }
}

/**
 * Format MT value for display
 */
export function formatMT(value: number): string {
  return `${value.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT`;
}

/**
 * Format hours for display
 */
export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return `${h} jam ${m} menit`;
}
