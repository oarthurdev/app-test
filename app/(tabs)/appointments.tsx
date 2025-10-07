import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface Appointment {
  id: number;
  appointmentDate: string;
  status: string;
  paymentStatus: string;
  serviceName: string;
  servicePrice: string;
  professionalName: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const STATUS_CONFIG = {
  confirmed: {
    label: 'Confirmado',
    color: theme.colors.success,
    icon: 'checkmark-circle' as const,
  },
  pending: {
    label: 'Pendente',
    color: theme.colors.warning,
    icon: 'time' as const,
  },
  cancelled: {
    label: 'Cancelado',
    color: theme.colors.error,
    icon: 'close-circle' as const,
  },
};

const PAYMENT_CONFIG = {
  paid: {
    label: 'Pago',
    color: theme.colors.success,
    icon: 'card' as const,
  },
  pending: {
    label: 'Pagamento Pendente',
    color: theme.colors.warning,
    icon: 'time' as const,
  },
};

export default function AppointmentsScreen() {
  const { user, token, guestClientId } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAppointments = async () => {
    try {
      let response;

      if (token && user) {
        // Cliente autenticado
        response = await fetch(`${API_URL}/api/appointments/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } else if (guestClientId) {
        // Cliente não autenticado (guest)
        response = await fetch(`${API_URL}/api/appointments/guest/${guestClientId}`);
      } else {
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error('Erro ao buscar agendamentos');

      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token || guestClientId) {
      fetchAppointments();
    } else {
      setLoading(false);
    }
  }, [token, guestClientId]);

  useEffect(() => {
    if (!loading && guestClientId && !user) {
      console.log('Cliente não autenticado com ID:', guestClientId);
    }
  }, [loading, guestClientId, user]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const date = new Date(item.appointmentDate);
    const statusInfo = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
    const paymentInfo = PAYMENT_CONFIG[item.paymentStatus as keyof typeof PAYMENT_CONFIG] || PAYMENT_CONFIG.pending;

    const isUpcoming = date > new Date();
    const isPast = date < new Date();

    return (
      <Card style={[styles.appointmentCard, isPast && styles.pastAppointment]}>
        <View style={styles.cardHeader}>
          <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
            <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
            <ThemedText style={[styles.badgeText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </ThemedText>
          </View>
          {isUpcoming && (
            <View style={styles.upcomingBadge}>
              <ThemedText style={styles.upcomingText}>Em breve</ThemedText>
            </View>
          )}
        </View>

        <ThemedText style={styles.serviceName}>{item.serviceName}</ThemedText>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={20} color={theme.colors.primary} />
          <ThemedText style={styles.infoText}>
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
          <ThemedText style={styles.infoText}>
            {date.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </ThemedText>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={20} color={theme.colors.primary} />
          <ThemedText style={styles.infoText}>{item.professionalName}</ThemedText>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.priceContainer}>
            <ThemedText style={styles.priceLabel}>Valor</ThemedText>
            <ThemedText style={styles.price}>
              R$ {parseFloat(item.servicePrice).toFixed(2)}
            </ThemedText>
          </View>

          <View style={[styles.paymentBadge, { backgroundColor: `${paymentInfo.color}20` }]}>
            <Ionicons name={paymentInfo.icon} size={14} color={paymentInfo.color} />
            <ThemedText style={[styles.paymentText, { color: paymentInfo.color }]}>
              {paymentInfo.label}
            </ThemedText>
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Carregando agendamentos...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="calendar" size={32} color={theme.colors.text.inverse} />
          </View>
          <ThemedText style={styles.title}>Meus Agendamentos</ThemedText>
          <ThemedText style={styles.subtitle}>
            {appointments.length === 0
              ? 'Você ainda não tem agendamentos'
              : `${appointments.length} agendamento${appointments.length > 1 ? 's' : ''}`}
          </ThemedText>
        </View>
      </LinearGradient>

      {appointments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={80} color={theme.colors.text.tertiary} />
          </View>
          <ThemedText style={styles.emptyTitle}>Nenhum agendamento ainda</ThemedText>
          <ThemedText style={styles.emptyText}>
            Explore nossos serviços e faça seu primeiro agendamento!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
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
    marginBottom: theme.spacing.md,
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
  listContent: {
    padding: theme.spacing.lg,
  },
  appointmentCard: {
    marginBottom: theme.spacing.lg,
  },
  pastAppointment: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  badgeText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  upcomingBadge: {
    backgroundColor: theme.colors.info,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  upcomingText: {
    color: theme.colors.text.inverse,
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  serviceName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    gap: theme.spacing.xs,
  },
  priceLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  price: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  paymentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    gap: theme.spacing.xs,
  },
  paymentText: {
    fontSize: theme.fontSize.xs,
    fontWeight: theme.fontWeight.semibold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.xl,
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
  },
});