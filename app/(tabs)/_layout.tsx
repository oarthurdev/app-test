import { Tabs, router } from 'expo-router';
import React from 'react';
import { Platform, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { theme } from '@/constants/Theme';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarLabelStyle: {
          textTransform: 'none',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Serviços',
          tabBarIcon: ({ color }) => <Ionicons name="cut" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Agendamentos',
          tabBarIcon: ({ color }) => <Ionicons name="calendar" size={24} color={color} />,
        }}
      />
      {user?.role === 'professional' && (
        <>
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notificações',
              tabBarIcon: ({ color }) => (
                <View>
                  <Ionicons name="notifications" size={24} color={color} />
                  {unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              ),
              tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
            }}
          />
          <Tabs.Screen
            name="admin"
            options={{
              title: 'Admin',
              tabBarIcon: ({ color }) => <Ionicons name="settings" size={24} color={color} />,
            }}
          />
        </>
      )}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons name="person" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: 10,
    fontWeight: 'bold',
  },
});
