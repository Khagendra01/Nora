import { Tabs } from 'expo-router';
import { Chrome as Home, Search, Heart, Bell, Clock } from 'lucide-react-native';
import { AuthGate } from '@/components/AuthGate';

export default function TabLayout() {
  return (
    <AuthGate>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 1,
            borderTopColor: '#F0F0F0',
            paddingBottom: 8,
            paddingTop: 8,
            height: 88,
          },
          tabBarActiveTintColor: '#0C121E',
          tabBarInactiveTintColor: '#999999',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ size, color }) => (
              <Home size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ size, color }) => (
              <Search size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ size, color }) => (
              <Heart size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="recently-played"
          options={{
            title: 'Recent',
            tabBarIcon: ({ size, color }) => (
              <Clock size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="notifications"
          options={{
            title: 'Notifications',
            tabBarIcon: ({ size, color }) => (
              <Bell size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGate>
  );
}