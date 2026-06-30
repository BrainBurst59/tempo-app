import { Ionicons } from '@expo/vector-icons';
import { brand } from '@tempo/ui';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fetchGameEngineSnapshot } from '../features/game/gameEngineClient';
import { mockHealthProvider } from '../features/health/MockHealthProvider';
import {
  BeastStatusCard,
  BiometricCard,
  CoachInsightCard,
  DarkScreen,
  MetricRing,
  ProgressStrip,
  RecommendationCard,
  SectionHeader,
  VerificationBadge,
  biometricTheme as t,
} from '../ui';

const game = fetchGameEngineSnapshot();
const health = mockHealthProvider.getSnapshot();

const WHY_THIS_PLAN =
  'Recovery is strong, sleep was stable, and your last hard lower-body session was 4 days ago. ' +
  'TempoBEAST is increasing strength exposure without pushing recovery too far.';

function Header() {
  return (
    <View style={s.header}>
      <Link href="/account" asChild>
        <Pressable accessibilityRole="button" accessibilityLabel="Account">
          <Ionicons name="person-circle-outline" size={30} color={t.colors.textSecondary} />
        </Pressable>
      </Link>
      <View style={s.dateNav}>
        <Ionicons name="chevron-back" size={16} color={t.colors.textMuted} />
        <Text style={s.dateText}>TODAY</Text>
        <Ionicons name="chevron-forward" size={16} color={t.colors.textMuted} />
      </View>
      <Link href="/health-monitor" asChild>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Health Monitor"
          style={s.deviceChip}
        >
          <Ionicons name="watch-outline" size={16} color={t.colors.recovery} />
          <Text style={s.deviceText}>54%</Text>
        </Pressable>
      </Link>
    </View>
  );
}

export function TodayCommandCenter() {
  return (
    <DarkScreen header={<Header />}>
      <Text style={s.wordmark}>{brand.name}</Text>

      <View style={s.ringRow}>
        <MetricRing
          display="82"
          label="Rhythm"
          progress={0.82}
          color={t.colors.strainBright}
          size={104}
          valueSize={28}
          caption="Stable training rhythm"
        />
        <MetricRing
          display="85%"
          label="Recovery"
          progress={0.85}
          color={t.colors.recovery}
          size={104}
          valueSize={28}
          caption="Ready for strength work"
        />
        <MetricRing
          display="14.2"
          label="Strain"
          progress={0.676}
          color={t.colors.strain}
          size={104}
          valueSize={26}
          caption="Moderate load"
        />
      </View>

      <SectionHeader title="Your Beast" accent={t.colors.cautionWarm} />
      <BeastStatusCard
        beastName={game.beast.beastName}
        stage="Charged"
        aura={game.beast.auraName}
        progress={game.beast.progressToNextStage}
        message={game.beast.message}
      />

      <SectionHeader title="Today" accent={t.colors.strain} />
      <RecommendationCard
        title="Lower Body Strength"
        durationLabel="45 min"
        estimatedStrain="17.4"
        intensity="Medium-high"
      />
      <CoachInsightCard text={WHY_THIS_PLAN} />

      <SectionHeader title="Quest of the day" accent={t.colors.recovery} />
      <BiometricCard accent={t.colors.recovery}>
        <View style={s.questHead}>
          <Text style={s.questTitle}>{game.quest.title}</Text>
          <VerificationBadge level={game.quest.requiredVerification} />
        </View>
        <View style={s.questMetaRow}>
          <Text style={[s.reward, { color: t.colors.recovery }]}>+{game.quest.rewardXp} XP</Text>
          <Text style={s.questProgressPct}>{Math.round(game.quest.progress * 100)}%</Text>
        </View>
        <ProgressStrip progress={game.quest.progress} color={t.colors.recovery} />
      </BiometricCard>

      <SectionHeader
        title="Wearable snapshot"
        accent={t.colors.health}
        action={
          <Link href="/health-monitor" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel="Open Health Monitor">
              <Text style={s.link}>Health Monitor ›</Text>
            </Pressable>
          </Link>
        }
      />
      <BiometricCard>
        <View style={s.snapGrid}>
          <Snap label="Sleep" value="7.2" unit="h" />
          <Snap label="Steps" value="6,850" />
          <Snap label="Resting HR" value="62" unit="bpm" />
          <Snap label="HRV" value="48" unit="ms" />
          <Snap label="Active" value="38" unit="min" />
          <Snap label="Recovery" value="85" unit="%" accent={t.colors.recovery} />
        </View>
        <View style={s.snapFooter}>
          <Ionicons name="sync-outline" size={12} color={t.colors.textMuted} />
          <Text style={s.snapFootText}>
            Last sync {health.capturedAtLabel} · {health.source}
          </Text>
        </View>
      </BiometricCard>
    </DarkScreen>
  );
}

function Snap({
  label,
  value,
  unit,
  accent = t.colors.white,
}: {
  label: string;
  value: string;
  unit?: string;
  accent?: string;
}) {
  return (
    <View style={s.snap}>
      <Text style={s.snapLabel}>{label}</Text>
      <View style={s.snapValueRow}>
        <Text style={[s.snapValue, { color: accent }]}>{value}</Text>
        {unit ? <Text style={s.snapUnit}>{unit}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  dateNav: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateText: { color: t.colors.white, fontSize: 14, fontWeight: '900', letterSpacing: 1.6 },
  deviceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: t.colors.glass,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: t.colors.line,
  },
  deviceText: { color: t.colors.textSecondary, fontSize: 12, fontWeight: '800' },
  wordmark: {
    color: t.colors.white,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 4,
    textAlign: 'center',
    textTransform: 'uppercase',
    opacity: 0.92,
  },
  ringRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: t.spacing.sm },
  questHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: t.spacing.md,
  },
  questTitle: { color: t.colors.white, fontSize: 16, fontWeight: '800', flex: 1 },
  questMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: t.spacing.md,
    marginBottom: t.spacing.sm,
  },
  reward: { fontSize: 18, fontWeight: '900' },
  questProgressPct: { color: t.colors.textSecondary, fontSize: 13, fontWeight: '800' },
  link: { color: t.colors.healthBright, fontSize: 12, fontWeight: '800' },
  snapGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  snap: { width: '33.3%', paddingVertical: t.spacing.sm },
  snapLabel: {
    color: t.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  snapValueRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, marginTop: 3 },
  snapValue: { fontSize: 20, fontWeight: '900' },
  snapUnit: { color: t.colors.textMuted, fontSize: 12, fontWeight: '700', marginBottom: 2 },
  snapFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: t.spacing.md },
  snapFootText: { color: t.colors.textMuted, fontSize: 12, fontWeight: '600' },
});
