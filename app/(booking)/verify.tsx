import { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function VerifyScreen() {
  const { serviceId, appointmentDate } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);

  const date = new Date(appointmentDate as string);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceId: Number(serviceId),
          appointmentDate: appointmentDate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao criar agendamento');
      }

      const appointment = await response.json();

      router.push({
        pathname: '/(booking)/payment',
        params: {
          appointmentId: appointment.id,
        },
      });
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Ionicons name="checkmark-circle" size={48} color={theme.colors.text.inverse} />
          </View>
          <ThemedText style={styles.title}>Verificação</ThemedText>
          <ThemedText style={styles.subtitle}>
            Confira os dados do seu agendamento
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="person" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Dados do Cliente</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Nome</ThemedText>
            <ThemedText style={styles.value}>{user?.name}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>E-mail</ThemedText>
            <ThemedText style={styles.value}>{user?.email}</ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Telefone</ThemedText>
            <ThemedText style={styles.value}>{user?.phone}</ThemedText>
          </View>
        </Card>

        <Card style={styles.infoCard}>
          <View style={styles.cardHeader}>
            <Ionicons name="calendar" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.cardTitle}>Agendamento</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Data</ThemedText>
            <ThemedText style={styles.value}>
              {date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Horário</ThemedText>
            <View style={styles.timeContainer}>
              <Ionicons name="time" size={18} color={theme.colors.primary} />
              <ThemedText style={styles.timeValue}>
                {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </ThemedText>
            </View>
          </View>
        </Card>

        <View style={styles.warningCard}>
          <Ionicons name="information-circle" size={24} color={theme.colors.info} />
          <ThemedText style={styles.warningText}>
            Verifique seus dados antes de continuar para o pagamento.
          </ThemedText>
        </View>

        <View style={styles.actions}>
          <Button
            title="Confirmar e Pagar"
            onPress={handleConfirm}
            loading={loading}
            fullWidth
            size="lg"
          />

          <Button
            title="Voltar"
            onPress={() => router.back()}
            variant="outline"
            fullWidth
            disabled={loading}
          />
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
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  infoCard: {
    marginBottom: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  cardTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.sm,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  timeValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: `${theme.colors.info}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
    marginBottom: theme.spacing.lg,
  },
  warningText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.info,
    lineHeight: 20,
  },
  actions: {
    gap: theme.spacing.md,
  },
});
