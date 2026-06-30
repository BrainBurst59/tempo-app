import { StyleSheet, Text, View } from 'react-native';
import { Circle, G, Line, Path, Polyline, Svg } from 'react-native-svg';
import { biometricTheme as t } from './theme';
import {
  circumference,
  clamp,
  dashOffset,
  describeArc,
  fraction,
  polarToCartesian,
} from './ringMath';

/**
 * Large circular score ring (Rhythm / Recovery / Strain). A muted track plus a
 * neon progress arc, with high-contrast numerics centered inside.
 */
export function MetricRing({
  display,
  label,
  progress,
  color,
  size = 132,
  strokeWidth = 11,
  caption,
  valueSize = t.typography.score,
}: {
  display: string;
  label: string;
  progress: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  caption?: string;
  valueSize?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const c = circumference(r);

  return (
    <View style={styles.ringWrap}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G rotation={-90} originX={cx} originY={cx}>
            <Circle
              cx={cx}
              cy={cx}
              r={r}
              stroke={t.colors.line}
              strokeWidth={strokeWidth}
              fill="none"
            />
            <Circle
              cx={cx}
              cy={cx}
              r={r}
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${c} ${c}`}
              strokeDashoffset={dashOffset(r, progress)}
              fill="none"
            />
          </G>
        </Svg>
        <View style={[StyleSheet.absoluteFill, styles.ringCenter]}>
          <Text style={[styles.ringValue, { fontSize: valueSize }]}>{display}</Text>
          <Text style={[styles.ringLabel, { color }]}>{label}</Text>
        </View>
      </View>
      {caption ? <Text style={styles.ringCaption}>{caption}</Text> : null}
    </View>
  );
}

/**
 * Semicircular radial gauge (e.g. a load / readiness index over a small range).
 * 240° sweep with a colored progress arc and a tick marker at the value.
 */
export function Gauge({
  value,
  min,
  max,
  color,
  size = 168,
  strokeWidth = 12,
}: {
  value: number;
  min: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}) {
  const start = -120;
  const end = 120;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const f = fraction(value, min, max);
  const valueAngle = start + (end - start) * f;
  const tick = polarToCartesian(cx, cx, r, valueAngle);
  const tickInner = polarToCartesian(cx, cx, r - strokeWidth, valueAngle);

  return (
    <Svg width={size} height={size * 0.72}>
      <Path
        d={describeArc(cx, cx, r, start, end)}
        stroke={t.colors.line}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d={describeArc(cx, cx, r, start, valueAngle)}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
      <Line
        x1={tick.x}
        y1={tick.y}
        x2={tickInner.x}
        y2={tickInner.y}
        stroke={t.colors.white}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

/** Thin line chart (e.g. a heart-rate trace) with an optional soft area fill. */
export function Sparkline({
  data,
  color,
  width = 280,
  height = 64,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return <View style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => `${i * stepX},${height - fraction(v, min, max) * (height - 6) - 3}`)
    .join(' ');

  return (
    <Svg width={width} height={height}>
      <Polyline points={points} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
    </Svg>
  );
}

/** Compact vertical bar chart (e.g. weekly load or HR-zone minutes). */
export function MiniBars({
  data,
  color,
  width = 280,
  height = 72,
}: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const max = Math.max(1, ...data);
  const gap = 6;
  const barW = (width - gap * (data.length - 1)) / data.length;

  return (
    <Svg width={width} height={height}>
      {data.map((v, i) => {
        const h = clamp((v / max) * height, 3, height);
        return (
          <Path
            key={i}
            d={`M ${i * (barW + gap)} ${height} v ${-h}`}
            stroke={color}
            strokeWidth={barW}
            strokeLinecap="round"
          />
        );
      })}
    </Svg>
  );
}

const styles = StyleSheet.create({
  ringWrap: { alignItems: 'center' },
  ringCenter: { alignItems: 'center', justifyContent: 'center' },
  ringValue: { color: t.colors.white, fontSize: t.typography.score, fontWeight: '900' },
  ringLabel: {
    fontSize: t.typography.micro,
    fontWeight: '900',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  ringCaption: {
    color: t.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: t.spacing.sm,
    textAlign: 'center',
    maxWidth: 140,
  },
});
