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

export default function PaymentScreen() {
  const { appointmentId } = useLocalSearchParams();
  const { token } = useAuth();
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    try {
      const intentResponse = await fetch(`${API_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: Number(appointmentId),
        }),
      });

      if (!intentResponse.ok) {
        throw new Error('Erro ao criar intenção de pagamento');
      }

      const { clientSecret } = await intentResponse.json();

      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log('MODO DEMONSTRAÇÃO: Payment Intent criado, simulando aprovação');

      const confirmResponse = await fetch(`${API_URL}/api/payments/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appointmentId: Number(appointmentId),
        }),
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error || 'Erro ao confirmar pagamento');
      }

      Alert.alert(
        'Sucesso! 🎉',
        'Pagamento realizado com sucesso! Você receberá uma confirmação por SMS.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setProcessing(false);
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
            <Ionicons name="card" size={48} color={theme.colors.text.inverse} />
          </View>
          <ThemedText style={styles.title}>Pagamento</ThemedText>
          <ThemedText style={styles.subtitle}>
            Finalize seu agendamento
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.demoCard}>
          <View style={styles.demoHeader}>
            <Ionicons name="flask" size={32} color={theme.colors.warning} />
            <ThemedText style={styles.demoTitle}>Modo Demonstração</ThemedText>
          </View>
          
          <ThemedText style={styles.demoText}>
            O pagamento está sendo simulado para fins de teste.
          </ThemedText>

          <View style={styles.demoDivider} />

          <View style={styles.demoInfo}>
            <Ionicons name="information-circle" size={20} color={theme.colors.info} />
            <View style={styles.demoInfoText}>
              <ThemedText style={styles.demoInfoTitle}>Em Produção:</ThemedText>
              <ThemedText style={styles.demoInfoDesc}>
                Esta tela integraria com @stripe/stripe-react-native com elementos de cartão seguros e processamento real.
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.processCard}>
          <ThemedText style={styles.processTitle}>Fluxo de Pagamento</ThemedText>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Criar Payment Intent</ThemedText>
              <ThemedText style={styles.stepDesc}>
                Sistema cria intenção de pagamento no Stripe
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Simular Aprovação</ThemedText>
              <ThemedText style={styles.stepDesc}>
                Em produção: coleta dados do cartão
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Confirmar Agendamento</ThemedText>
              <ThemedText style={styles.stepDesc}>
                Atualiza status no banco de dados
              </ThemedText>
            </View>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>4</ThemedText>
            </View>
            <View style={styles.stepContent}>
              <ThemedText style={styles.stepTitle}>Enviar Confirmação</ThemedText>
              <ThemedText style={styles.stepDesc}>
                SMS via Twilio (se configurado)
              </ThemedText>
            </View>
          </View>
        </Card>

        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="receipt-outline" size={24} color={theme.colors.text.secondary} />
            <View style={styles.statusInfo}>
              <ThemedText style={styles.statusLabel}>Agendamento</ThemedText>
              <ThemedText style={styles.statusValue}>#{appointmentId}</ThemedText>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <Ionicons name="time-outline" size={16} color={theme.colors.warning} />
            <ThemedText style={styles.statusBadgeText}>Aguardando pagamento</ThemedText>
          </View>
        </Card>

        <Button
          title={processing ? "Processando..." : "Pagar Agora"}
          onPress={handlePayment}
          loading={processing}
          fullWidth
          size="lg"
        />

        <Button
          title="Cancelar"
          onPress={() => router.back()}
          variant="outline"
          fullWidth
          disabled={processing}
        />

        <View style={styles.bottomSpacing} />
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
    gap: theme.spacing.lg,
  },
  demoCard: {
    backgroundColor: `${theme.colors.warning}10`,
    borderWidth: 2,
    borderColor: `${theme.colors.warning}30`,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  demoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.warning,
  },
  demoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
  },
  demoDivider: {
    height: 1,
    backgroundColor: `${theme.colors.warning}20`,
    marginVertical: theme.spacing.md,
  },
  demoInfo: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  demoInfoText: {
    flex: 1,
  },
  demoInfoTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.info,
    marginBottom: 4,
  },
  demoInfoDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  processCard: {
  },
  processTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
  },
  step: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    color: theme.colors.text.inverse,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.bold,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  statusCard: {
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  statusValue: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.warning}20`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
    fontWeight: theme.fontWeight.semibold,
  },
  bottomSpacing: {
    height: theme.spacing.lg,
  },
});
