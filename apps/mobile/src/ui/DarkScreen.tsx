import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { biometricTheme as t } from './theme';

/**
 * Near-black scrollable screen scaffold for the biometric command-center
 * surfaces. Keeps the premium dark canvas and safe-area padding consistent.
 */
export function DarkScreen({ children, header }: { children: ReactNode; header?: ReactNode }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {header ? <View style={styles.header}>{header}</View> : null}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: t.colors.background },
  header: {
    paddingHorizontal: t.spacing.xl,
    paddingTop: t.spacing.sm,
    paddingBottom: t.spacing.md,
  },
  scroll: { flex: 1 },
  content: { paddingHorizontal: t.spacing.xl, paddingBottom: 48, gap: t.spacing.lg },
});
