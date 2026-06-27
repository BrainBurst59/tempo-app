import { tempoColors } from '@tempo/ui';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tempoColors.hotCoral,
        tabBarInactiveTintColor: tempoColors.stone,
        tabBarStyle: {
          backgroundColor: tempoColors.graphite950,
          borderTopColor: 'rgba(255,255,255,0.08)',
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}
    >
      <Tabs.Screen name="today" options={{ title: 'Today' }} />
      <Tabs.Screen name="train" options={{ title: 'Train' }} />
      <Tabs.Screen name="fuel" options={{ title: 'Fuel' }} />
      <Tabs.Screen name="move" options={{ title: 'Move' }} />
      <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
    </Tabs>
  );
}
