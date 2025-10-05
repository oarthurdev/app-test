import { StyleSheet, View, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '@/contexts/NotificationContext';
import { useEffect } from 'react';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function ProfileScreen() {
  const { user, logout, token } = useAuth();
  const {
    notifications,
    unreadCount,
    registerForPushNotifications,
    markAsRead,
    markAllAsRead
  } = useNotifications();

  useEffect(() => {
    if (user?.role === 'professional') {
      setupPushNotifications();
    }
  }, [user]);

  const setupPushNotifications = async () => {
    const pushToken = await registerForPushNotifications();
    if (pushToken && token) {
      try {
        await fetch(`${API_URL}/api/auth/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ pushToken }),
        });
      } catch (error) {
        console.error('Error registering push token:', error);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair da sua conta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const isProfessional = user?.role === 'professional';

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarText}>
                {user?.name?.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            {isProfessional && (
              <View style={styles.badgeContainer}>
                <Ionicons name="star" size={16} color={theme.colors.warning} />
              </View>
            )}
          </View>
          <ThemedText style={styles.userName}>{user?.name}</ThemedText>
          <ThemedText style={styles.userRole}>
            {isProfessional ? '⭐ Profissional' : '👤 Cliente'}
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Informações Pessoais</ThemedText>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="mail-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>E-mail</ThemedText>
                <ThemedText style={styles.infoValue}>{user?.email}</ThemedText>
              </View>
            </View>
          </Card>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons name="call-outline" size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Telefone</ThemedText>
                <ThemedText style={styles.infoValue}>{user?.phone}</ThemedText>
              </View>
            </View>
          </Card>

          <Card style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={isProfessional ? "briefcase-outline" : "person-outline"}
                  size={24}
                  color={theme.colors.primary}
                />
              </View>
              <View style={styles.infoContent}>
                <ThemedText style={styles.infoLabel}>Tipo de Conta</ThemedText>
                <ThemedText style={styles.infoValue}>
                  {isProfessional ? 'Conta Profissional' : 'Conta Cliente'}
                </ThemedText>
              </View>
            </View>
          </Card>
        </View>

        {isProfessional && notifications.length > 0 && (
          <View style={styles.notificationsSection}>
            <View style={styles.notificationsHeader}>
              <ThemedText style={styles.sectionTitle}>
                Notificações {unreadCount > 0 && `(${unreadCount})`}
              </ThemedText>
              {unreadCount > 0 && (
                <TouchableOpacity onPress={markAllAsRead}>
                  <ThemedText style={styles.markAllRead}>Marcar todas como lidas</ThemedText>
                </TouchableOpacity>
              )}
            </View>

            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => !notification.read && markAsRead(notification.id)}
              >
                <Card style={[styles.notificationCard, !notification.read && styles.unreadNotification]}>
                  <View style={styles.notificationContent}>
                    <ThemedText style={styles.notificationTitle}>{notification.title}</ThemedText>
                    <ThemedText style={styles.notificationMessage}>{notification.message}</ThemedText>
                    <ThemedText style={styles.notificationDate}>
                      {new Date(notification.createdAt).toLocaleString('pt-BR')}
                    </ThemedText>
                  </View>
                  {!notification.read && <View style={styles.unreadDot} />}
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {isProfessional && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recursos Profissionais</ThemedText>
            <Card style={styles.featureCard}>
              <View style={styles.featureContent}>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.success} />
                <View style={styles.featureText}>
                  <ThemedText style={styles.featureTitle}>Gerenciar Serviços</ThemedText>
                  <ThemedText style={styles.featureDescription}>
                    Acesse o painel Admin para cadastrar e gerenciar seus serviços
                  </ThemedText>
                </View>
              </View>
            </Card>
          </View>
        )}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Configurações</ThemedText>

          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            variant="outline"
            fullWidth
            style={styles.logoutButton}
          />
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Versão 1.0.0
          </ThemedText>
        </View>
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
    paddingBottom: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  badgeContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.text.inverse,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  userName: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
  },
  userRole: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  infoContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  infoLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  featureCard: {
    marginBottom: theme.spacing.md,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  notificationsSection: {
    marginBottom: theme.spacing.lg,
  },
  notificationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  markAllRead: {
    fontSize: 14,
    color: theme.colors.primary,
  },
  notificationCard: {
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  unreadNotification: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  notificationContent: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  logoutButton: {
    borderColor: theme.colors.error,
    marginTop: 32,
    marginBottom: 32,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
});