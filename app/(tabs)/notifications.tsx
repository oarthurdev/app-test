import { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  RefreshControl, 
  Animated 
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useNotifications } from '@/contexts/NotificationContext';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

const NOTIFICATION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  appointment: 'calendar',
  payment: 'card',
  reminder: 'alarm',
  general: 'notifications',
};

export default function NotificationsScreen() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadNotifications,
  } = useNotifications();

  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const filteredNotifications = filter === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const handleNotificationPress = async (notificationId: number, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const getNotificationIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.general;
  };

  const getTimeAgo = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - notifDate.getTime()) / 60000);

    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return notifDate.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="notifications" size={32} color={theme.colors.text.inverse} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
              </View>
            )}
          </View>
          <ThemedText style={styles.title}>Notificações</ThemedText>
          <ThemedText style={styles.subtitle}>
            {notifications.length === 0
              ? 'Você não tem notificações'
              : unreadCount > 0
              ? `${unreadCount} não lida${unreadCount > 1 ? 's' : ''}`
              : 'Todas as notificações lidas'}
          </ThemedText>
        </View>
      </LinearGradient>

      {notifications.length > 0 && (
        <View style={styles.filterContainer}>
          <View style={styles.filterButtons}>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
              onPress={() => setFilter('all')}
            >
              <ThemedText
                style={[styles.filterButtonText, filter === 'all' && styles.filterButtonTextActive]}
              >
                Todas ({notifications.length})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filter === 'unread' && styles.filterButtonActive]}
              onPress={() => setFilter('unread')}
            >
              <ThemedText
                style={[styles.filterButtonText, filter === 'unread' && styles.filterButtonTextActive]}
              >
                Não lidas ({unreadCount})
              </ThemedText>
            </TouchableOpacity>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
              <Ionicons name="checkmark-done" size={18} color={theme.colors.primary} />
              <ThemedText style={styles.markAllText}>Marcar todas</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      )}

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary}
          />
        }
      >
        {filteredNotifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name={filter === 'unread' ? 'checkmark-done-circle' : 'notifications-off'}
                size={80}
                color={theme.colors.text.tertiary}
              />
            </View>
            <ThemedText style={styles.emptyTitle}>
              {filter === 'unread'
                ? 'Nenhuma notificação não lida'
                : 'Nenhuma notificação ainda'}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {filter === 'unread'
                ? 'Você está em dia com todas as suas notificações!'
                : 'Quando algo importante acontecer, você será notificado aqui.'}
            </ThemedText>
          </View>
        ) : (
          filteredNotifications.map((notification, index) => (
            <TouchableOpacity
              key={notification.id}
              onPress={() => handleNotificationPress(notification.id, notification.read)}
              activeOpacity={0.7}
            >
              <Card
                style={[
                  styles.notificationCard,
                  !notification.read && styles.unreadNotification,
                ]}
              >
                <View style={styles.notificationHeader}>
                  <View style={[
                    styles.iconCircle,
                    !notification.read && styles.iconCircleUnread,
                  ]}>
                    <Ionicons
                      name={getNotificationIcon(notification.type)}
                      size={24}
                      color={!notification.read ? theme.colors.primary : theme.colors.text.secondary}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.titleRow}>
                      <ThemedText
                        style={[
                          styles.notificationTitle,
                          !notification.read && styles.notificationTitleUnread,
                        ]}
                      >
                        {notification.title}
                      </ThemedText>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <ThemedText style={styles.notificationMessage}>
                      {notification.message}
                    </ThemedText>
                    <View style={styles.notificationFooter}>
                      <Ionicons name="time-outline" size={12} color={theme.colors.text.tertiary} />
                      <ThemedText style={styles.notificationTime}>
                        {getTimeAgo(notification.createdAt)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}

        {notifications.length > 0 && (
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              {filteredNotifications.length === notifications.length
                ? 'Todas as notificações exibidas'
                : `Exibindo ${filteredNotifications.length} de ${notifications.length} notificações`}
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  headerIcon: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    height: 24,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  badgeText: {
    color: theme.colors.text.inverse,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.bold,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterContainer: {
    backgroundColor: theme.colors.background.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  filterButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.tertiary,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  filterButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  filterButtonTextActive: {
    color: theme.colors.text.inverse,
  },
  markAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  markAllText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.medium,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  notificationCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}05`,
  },
  notificationHeader: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircleUnread: {
    backgroundColor: `${theme.colors.primary}15`,
  },
  notificationContent: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: 4,
  },
  notificationTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  notificationTitleUnread: {
    fontWeight: theme.fontWeight.bold,
  },
  notificationMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  notificationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl * 2,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.xl,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  footer: {
    paddingVertical: theme.spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
});
