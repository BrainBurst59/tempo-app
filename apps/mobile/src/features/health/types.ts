/**
 * Mock health signals are used for prototype UI. Real HealthKit / Health Connect
 * integration requires native permissions and a development build.
 *
 * This abstraction lets a real wearable provider (HealthKit, Health Connect,
 * Apple Watch, etc.) be added later behind the same `HealthProvider` shape
 * without touching the UI. No medical claims: these are wellness/training
 * signals only, never diagnosis.
 */

export type WearableSignalStatus =
  'within_range' | 'elevated' | 'low' | 'recalibrating' | 'syncing' | 'mock';

/** One wearable/health metric for the dense Health Monitor grid. */
export type WearableSignal = {
  key: string;
  label: string;
  value: string;
  unit?: string;
  status: WearableSignalStatus;
  /** Optional series for a thin line chart. */
  trend?: number[];
  accent?: 'strain' | 'recovery' | 'caution' | 'health';
};

/** Readiness/recovery signal (training guidance, not a medical readout). */
export type RecoverySignal = {
  score: number;
  status: WearableSignalStatus;
  readiness: string;
};

/** Corroborating signals that would raise workout verification confidence. */
export type VerificationSignal = {
  confidence: 'unverified' | 'standard' | 'high_confidence' | 'suspicious';
  sources: string[];
};

/** A point-in-time snapshot of the user's wearable signals. */
export type HealthSnapshot = {
  source: string;
  capturedAtLabel: string;
  sleepHours: number;
  steps: number;
  restingHr: number;
  hrv: number;
  activeMinutes: number;
  recovery: RecoverySignal;
  verification: VerificationSignal;
  signals: WearableSignal[];
};

/**
 * Health data source. The mock is synchronous; a real provider would be async
 * and gated on native permissions + a development build.
 */
export interface HealthProvider {
  readonly name: string;
  getSnapshot(): HealthSnapshot;
}
