// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
  <Tabs>
    <Tabs.Screen
        name="index"
        options={{
          title: 'Nest Mate', // 👈 this controls the visible title
          headerTitle: 'Nest Mate', // 👈 this ensures header shows 'Nest Mate'
        }}
    />
    <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
    <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
  </Tabs>
  );
}
