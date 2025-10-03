import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, Alert, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dom', fullLabel: 'Domingo' },
  { value: 1, label: 'Seg', fullLabel: 'Segunda' },
  { value: 2, label: 'Ter', fullLabel: 'Terça' },
  { value: 3, label: 'Qua', fullLabel: 'Quarta' },
  { value: 4, label: 'Qui', fullLabel: 'Quinta' },
  { value: 5, label: 'Sex', fullLabel: 'Sexta' },
  { value: 6, label: 'Sáb', fullLabel: 'Sábado' },
];

export default function AdminScreen() {
  const { token, user } = useAuth();
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'professional') {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="lock-closed" size={64} color={theme.colors.text.tertiary} />
          <ThemedText style={styles.accessDeniedTitle}>Acesso Restrito</ThemedText>
          <ThemedText style={styles.accessDeniedText}>
            Apenas profissionais podem acessar esta página
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleAddService = async () => {
    if (!serviceName || !servicePrice || !serviceDuration) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/services`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: serviceName,
          description: serviceDescription,
          price: servicePrice,
          duration: parseInt(serviceDuration),
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar serviço');
      }

      Alert.alert('Sucesso! 🎉', 'Serviço cadastrado com sucesso!');
      setServiceName('');
      setServiceDescription('');
      setServicePrice('');
      setServiceDuration('');
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBusinessHour = async () => {
    if (!startTime || !endTime) {
      Alert.alert('Erro', 'Por favor, preencha os horários');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/business-hours`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          dayOfWeek: selectedDay,
          startTime,
          endTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao cadastrar horário');
      }

      Alert.alert('Sucesso! 🎉', 'Horário cadastrado com sucesso!');
      setStartTime('');
      setEndTime('');
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
            <Ionicons name="settings" size={32} color={theme.colors.text.inverse} />
          </View>
          <ThemedText style={styles.title}>Painel Admin</ThemedText>
          <ThemedText style={styles.subtitle}>
            Gerencie seus serviços e horários
          </ThemedText>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase-outline" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>Novo Serviço</ThemedText>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Nome do Serviço *"
              placeholder="Ex: Corte de Cabelo"
              value={serviceName}
              onChangeText={setServiceName}
              icon="cut-outline"
            />

            <Input
              label="Descrição"
              placeholder="Descreva seu serviço"
              value={serviceDescription}
              onChangeText={setServiceDescription}
              multiline
              numberOfLines={3}
              icon="document-text-outline"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Preço (R$) *"
                  placeholder="50.00"
                  value={servicePrice}
                  onChangeText={setServicePrice}
                  keyboardType="decimal-pad"
                  icon="cash-outline"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Duração (min) *"
                  placeholder="30"
                  value={serviceDuration}
                  onChangeText={setServiceDuration}
                  keyboardType="number-pad"
                  icon="time-outline"
                />
              </View>
            </View>

            <Button
              title="Adicionar Serviço"
              onPress={handleAddService}
              loading={loading}
              fullWidth
              size="lg"
            />
          </Card>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
            <ThemedText style={styles.sectionTitle}>Horário de Funcionamento</ThemedText>
          </View>

          <Card style={styles.formCard}>
            <View style={styles.labelContainer}>
              <ThemedText style={styles.label}>Dia da Semana</ThemedText>
            </View>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              style={styles.dayScroll}
              contentContainerStyle={styles.dayScrollContent}
            >
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[
                    styles.dayButton,
                    selectedDay === day.value && styles.dayButtonSelected,
                  ]}
                  onPress={() => setSelectedDay(day.value)}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[
                      styles.dayButtonText,
                      selectedDay === day.value && styles.dayButtonTextSelected,
                    ]}
                  >
                    {day.label}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.selectedDayInfo}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <ThemedText style={styles.selectedDayText}>
                {DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.fullLabel}
              </ThemedText>
            </View>

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="Horário Inicial *"
                  placeholder="09:00"
                  value={startTime}
                  onChangeText={setStartTime}
                  icon="play-outline"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Horário Final *"
                  placeholder="18:00"
                  value={endTime}
                  onChangeText={setEndTime}
                  icon="stop-outline"
                />
              </View>
            </View>

            <Button
              title="Adicionar Horário"
              onPress={handleAddBusinessHour}
              loading={loading}
              fullWidth
              size="lg"
              variant="secondary"
            />
          </Card>
        </View>

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  accessDeniedTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  accessDeniedText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  formCard: {
    padding: theme.spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  labelContainer: {
    marginBottom: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  dayScroll: {
    marginBottom: theme.spacing.md,
  },
  dayScrollContent: {
    gap: theme.spacing.sm,
  },
  dayButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 60,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  dayButtonText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  dayButtonTextSelected: {
    color: theme.colors.text.inverse,
  },
  selectedDayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.success}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  selectedDayText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
