import { useState } from 'react';
import { StyleSheet, View, Alert, ScrollView, TextInput } from 'react-native';
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
  const { user, token, setTempToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  const date = new Date(appointmentDate as string);

  const handleConfirm = async () => {
    if (!user) {
      if (!guestName || !guestEmail || !guestPhone) {
        Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os seus dados para continuar.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guestEmail)) {
        Alert.alert('Email inválido', 'Por favor, digite um email válido.');
        return;
      }

      const phoneRegex = /^\d{10,11}$/;
      const cleanPhone = guestPhone.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        Alert.alert('Telefone inválido', 'Por favor, digite um telefone válido com DDD (apenas números).');
        return;
      }
    }

    setLoading(true);
    try {
      const requestBody = user ? {
        serviceId: Number(serviceId),
        appointmentDate: appointmentDate,
        phone: user.phone,
      } : {
        serviceId: Number(serviceId),
        appointmentDate: appointmentDate,
        phone: guestPhone.replace(/\D/g, ''),
        guestName: guestName,
        guestEmail: guestEmail,
      };

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/appointments/request-verification`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao solicitar código de verificação');
      }

      const data = await response.json();
      setAppointmentId(data.appointmentId);
      setCodeSent(true);
      Alert.alert(
        'Código Enviado! ✅',
        'Um código de verificação foi enviado para o seu WhatsApp. Por favor, digite-o abaixo.'
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!appointmentId) {
      Alert.alert('Erro', 'ID do agendamento não encontrado');
      return;
    }

    setLoading(true);
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/appointments/verify-code`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          appointmentId: appointmentId,
          verificationCode: verificationCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao verificar o código');
      }

      const data = await response.json();

      // Salvar token temporário se for um convidado
      if (data.tempClientToken && !user) {
        await setTempToken(data.tempClientToken);
      }

      Alert.alert(
        'Sucesso! 🎉',
        'Seu agendamento foi confirmado! Você receberá uma confirmação por WhatsApp.\n\nO pagamento será realizado após o serviço.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/appointments');
            },
          },
        ]
      );
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

          {user ? (
            <>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Nome</ThemedText>
                <ThemedText style={styles.value}>{user.name}</ThemedText>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>E-mail</ThemedText>
                <ThemedText style={styles.value}>{user.email}</ThemedText>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Telefone</ThemedText>
                <ThemedText style={styles.value}>{user.phone}</ThemedText>
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Nome completo *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={guestName}
                  onChangeText={setGuestName}
                  placeholder="Digite seu nome"
                  placeholderTextColor={theme.colors.text.tertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>E-mail *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={guestEmail}
                  onChangeText={setGuestEmail}
                  placeholder="seu@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.text.tertiary}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Telefone (WhatsApp) *</ThemedText>
                <TextInput
                  style={styles.input}
                  value={guestPhone}
                  onChangeText={setGuestPhone}
                  placeholder="(11) 99999-9999"
                  keyboardType="phone-pad"
                  placeholderTextColor={theme.colors.text.tertiary}
                />
                <ThemedText style={styles.inputHint}>
                  Digite apenas números com DDD
                </ThemedText>
              </View>
            </>
          )}
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
            Verifique seus dados antes de continuar.
          </ThemedText>
        </View>

        {codeSent && (
          <Card style={styles.codeCard}>
            <View style={styles.codeHeader}>
              <Ionicons name="lock-closed" size={24} color={theme.colors.primary} />
              <ThemedText style={styles.codeTitle}>Código de Verificação</ThemedText>
            </View>
            <ThemedText style={styles.codeDescription}>
              Digite o código de 6 dígitos enviado para seu WhatsApp
            </ThemedText>
            <TextInput
              style={styles.codeInput}
              value={verificationCode}
              onChangeText={setVerificationCode}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              placeholderTextColor={theme.colors.text.tertiary}
            />
          </Card>
        )}

        <View style={styles.actions}>
          {!codeSent ? (
            <>
              <Button
                title="Solicitar Código"
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
            </>
          ) : (
            <>
              <Button
                title="Verificar e Confirmar"
                onPress={handleVerifyCode}
                loading={loading}
                fullWidth
                size="lg"
              />

              <Button
                title="Reenviar Código"
                onPress={handleConfirm}
                variant="outline"
                fullWidth
                disabled={loading}
              />
            </>
          )}
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
  codeCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  codeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  codeTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  codeDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  codeInput: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    textAlign: 'center',
    color: theme.colors.text.primary,
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.secondary,
  },
  inputHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});