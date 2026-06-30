import type { HealthProvider, HealthSnapshot, WearableSignal } from './types';

/**
 * Mock health signals are used for prototype UI. Real HealthKit / Health Connect
 * integration requires native permissions and a development build.
 *
 * Values are static, plausible placeholders so the dark biometric UI can be
 * reviewed without any device or wearable. No real integration is performed.
 */

const SIGNALS: WearableSignal[] = [
  {
    key: 'hr',
    label: 'Heart Rate',
    value: '64',
    unit: 'bpm',
    status: 'within_range',
    accent: 'strain',
    trend: [58, 61, 60, 66, 72, 69, 63, 64],
  },
  {
    key: 'rhr',
    label: 'Resting HR',
    value: '62',
    unit: 'bpm',
    status: 'within_range',
    accent: 'strain',
  },
  { key: 'hrv', label: 'HRV', value: '48', unit: 'ms', status: 'within_range', accent: 'recovery' },
  {
    key: 'sleep',
    label: 'Sleep',
    value: '7.2',
    unit: 'h',
    status: 'within_range',
    accent: 'recovery',
  },
  {
    key: 'recovery',
    label: 'Recovery',
    value: '85',
    unit: '%',
    status: 'within_range',
    accent: 'recovery',
  },
  {
    key: 'mobility',
    label: 'Mobility',
    value: '72',
    unit: '%',
    status: 'elevated',
    accent: 'caution',
  },
  {
    key: 'resp',
    label: 'Respiratory Rate',
    value: '14.6',
    unit: 'br/min',
    status: 'mock',
    accent: 'health',
  },
  {
    key: 'spo2',
    label: 'Blood Oxygen',
    value: '—',
    unit: '%',
    status: 'recalibrating',
    accent: 'health',
  },
  {
    key: 'skin_temp',
    label: 'Skin Temp',
    value: '—',
    unit: '°',
    status: 'syncing',
    accent: 'health',
  },
  {
    key: 'workout_min',
    label: 'Workout Minutes',
    value: '38',
    unit: 'min',
    status: 'within_range',
    accent: 'strain',
  },
  { key: 'steps', label: 'Steps', value: '6,850', status: 'within_range', accent: 'strain' },
  {
    key: 'active_energy',
    label: 'Active Energy',
    value: '—',
    unit: 'kcal',
    status: 'mock',
    accent: 'caution',
  },
];

export class MockHealthProvider implements HealthProvider {
  readonly name = 'MockHealthProvider';

  getSnapshot(): HealthSnapshot {
    return {
      source: this.name,
      capturedAtLabel: '12 min ago',
      sleepHours: 7.2,
      steps: 6850,
      restingHr: 62,
      hrv: 48,
      activeMinutes: 38,
      recovery: {
        score: 85,
        status: 'within_range',
        readiness: 'Ready for strength work',
      },
      verification: {
        confidence: 'high_confidence',
        sources: ['motion', 'heart_rate', 'workout_session'],
      },
      signals: SIGNALS,
    };
  }
}

/** Default provider instance for the prototype UI. */
export const mockHealthProvider = new MockHealthProvider();
