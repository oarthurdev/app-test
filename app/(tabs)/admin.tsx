
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

type ActiveTab = 'services' | 'hours';

export default function AdminScreen() {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('services');
  
  // Service form states
  const [serviceName, setServiceName] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDuration, setServiceDuration] = useState('');
  
  // Business hours form states
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
      Alert.alert('Campos obrigatórios', 'Preencha nome, preço e duração do serviço');
      return;
    }

    const priceValue = parseFloat(servicePrice.replace(',', '.'));
    if (isNaN(priceValue) || priceValue <= 0) {
      Alert.alert('Erro', 'Digite um preço válido');
      return;
    }

    const durationValue = parseInt(serviceDuration);
    if (isNaN(durationValue) || durationValue <= 0) {
      Alert.alert('Erro', 'Digite uma duração válida em minutos');
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
          price: priceValue.toFixed(2),
          duration: durationValue,
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
      Alert.alert('Campos obrigatórios', 'Preencha os horários de início e fim');
      return;
    }

    // Validate time format
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert('Formato inválido', 'Use o formato HH:MM (ex: 09:00)');
      return;
    }

    // Validate that end time is after start time
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    if (endMinutes <= startMinutes) {
      Alert.alert('Erro', 'O horário final deve ser posterior ao horário inicial');
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
            <Ionicons name="settings-outline" size={32} color={theme.colors.text.inverse} />
          </View>
          <ThemedText style={styles.title}>Painel Administrativo</ThemedText>
          <ThemedText style={styles.subtitle}>
            Configure seus serviços e disponibilidade
          </ThemedText>
        </View>

        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'services' && styles.tabActive]}
            onPress={() => setActiveTab('services')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="briefcase" 
              size={20} 
              color={activeTab === 'services' ? theme.colors.primary : theme.colors.text.inverse} 
            />
            <ThemedText style={[
              styles.tabText,
              activeTab === 'services' && styles.tabTextActive
            ]}>
              Serviços
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'hours' && styles.tabActive]}
            onPress={() => setActiveTab('hours')}
            activeOpacity={0.7}
          >
            <Ionicons 
              name="time" 
              size={20} 
              color={activeTab === 'hours' ? theme.colors.primary : theme.colors.text.inverse} 
            />
            <ThemedText style={[
              styles.tabText,
              activeTab === 'hours' && styles.tabTextActive
            ]}>
              Horários
            </ThemedText>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'services' ? (
          <View style={styles.tabContent}>
            <Card style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                <ThemedText style={styles.infoTitle}>Como funciona?</ThemedText>
              </View>
              <ThemedText style={styles.infoText}>
                Cadastre os serviços que você oferece. Cada serviço precisa ter um nome, preço e duração estimada.
              </ThemedText>
            </Card>

            <Card style={styles.formCard}>
              <View style={styles.formHeader}>
                <Ionicons name="add-circle" size={28} color={theme.colors.primary} />
                <ThemedText style={styles.formTitle}>Novo Serviço</ThemedText>
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="cut" size={18} color={theme.colors.text.secondary} />
                  <ThemedText style={styles.fieldLabel}>Nome do Serviço</ThemedText>
                </View>
                <Input
                  placeholder="Ex: Corte de Cabelo Masculino"
                  value={serviceName}
                  onChangeText={setServiceName}
                />
              </View>

              <View style={styles.fieldGroup}>
                <View style={styles.fieldHeader}>
                  <Ionicons name="document-text" size={18} color={theme.colors.text.secondary} />
                  <ThemedText style={styles.fieldLabel}>Descrição (opcional)</ThemedText>
                </View>
                <Input
                  placeholder="Descreva os detalhes do serviço"
                  value={serviceDescription}
                  onChangeText={setServiceDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.fieldGroup, styles.flex1]}>
                  <View style={styles.fieldHeader}>
                    <Ionicons name="cash" size={18} color={theme.colors.text.secondary} />
                    <ThemedText style={styles.fieldLabel}>Preço (R$)</ThemedText>
                  </View>
                  <Input
                    placeholder="50.00"
                    value={servicePrice}
                    onChangeText={setServicePrice}
                    keyboardType="decimal-pad"
                  />
                  <ThemedText style={styles.fieldHint}>Use ponto ou vírgula</ThemedText>
                </View>

                <View style={[styles.fieldGroup, styles.flex1]}>
                  <View style={styles.fieldHeader}>
                    <Ionicons name="hourglass" size={18} color={theme.colors.text.secondary} />
                    <ThemedText style={styles.fieldLabel}>Duração</ThemedText>
                  </View>
                  <Input
                    placeholder="30"
                    value={serviceDuration}
                    onChangeText={setServiceDuration}
                    keyboardType="number-pad"
                  />
                  <ThemedText style={styles.fieldHint}>Em minutos</ThemedText>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Cadastrar Serviço"
                  onPress={handleAddService}
                  loading={loading}
                  fullWidth
                  size="lg"
                />
              </View>
            </Card>
          </View>
        ) : (
          <View style={styles.tabContent}>
            <Card style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
                <ThemedText style={styles.infoTitle}>Como funciona?</ThemedText>
              </View>
              <ThemedText style={styles.infoText}>
                Configure seus horários de atendimento por dia da semana. Você pode ter horários diferentes para cada dia.
              </ThemedText>
            </Card>

            <Card style={styles.formCard}>
              <View style={styles.formHeader}>
                <Ionicons name="calendar" size={28} color={theme.colors.primary} />
                <ThemedText style={styles.formTitle}>Novo Horário</ThemedText>
              </View>

              <View style={styles.stepContainer}>
                <View style={styles.stepBadge}>
                  <ThemedText style={styles.stepNumber}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Selecione o dia da semana</ThemedText>
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

                  <View style={styles.selectedDayBanner}>
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                    <ThemedText style={styles.selectedDayText}>
                      {DAYS_OF_WEEK.find((d) => d.value === selectedDay)?.fullLabel}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.stepDivider} />

              <View style={styles.stepContainer}>
                <View style={styles.stepBadge}>
                  <ThemedText style={styles.stepNumber}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={styles.stepTitle}>Defina o período de atendimento</ThemedText>
                  
                  <View style={styles.timeRow}>
                    <View style={styles.timeGroup}>
                      <View style={styles.timeHeader}>
                        <Ionicons name="play-circle" size={20} color={theme.colors.success} />
                        <ThemedText style={styles.timeLabel}>Abertura</ThemedText>
                      </View>
                      <Input
                        placeholder="09:00"
                        value={startTime}
                        onChangeText={setStartTime}
                      />
                    </View>

                    <View style={styles.timeArrow}>
                      <Ionicons name="arrow-forward" size={24} color={theme.colors.text.tertiary} />
                    </View>

                    <View style={styles.timeGroup}>
                      <View style={styles.timeHeader}>
                        <Ionicons name="stop-circle" size={20} color={theme.colors.error} />
                        <ThemedText style={styles.timeLabel}>Fechamento</ThemedText>
                      </View>
                      <Input
                        placeholder="18:00"
                        value={endTime}
                        onChangeText={setEndTime}
                      />
                    </View>
                  </View>

                  <View style={styles.timeHintCard}>
                    <Ionicons name="bulb" size={16} color={theme.colors.warning} />
                    <ThemedText style={styles.timeHint}>
                      Use o formato 24h (HH:MM). Ex: 09:00 ou 18:30
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.buttonContainer}>
                <Button
                  title="Adicionar Horário"
                  onPress={handleAddBusinessHour}
                  loading={loading}
                  fullWidth
                  size="lg"
                  variant="secondary"
                />
              </View>
            </Card>
          </View>
        )}

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
    paddingBottom: 0,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
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
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabActive: {
    backgroundColor: theme.colors.background.secondary,
  },
  tabText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.inverse,
  },
  tabTextActive: {
    color: theme.colors.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
  },
  tabContent: {
    paddingTop: theme.spacing.lg,
  },
  infoCard: {
    backgroundColor: `${theme.colors.primary}15`,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `${theme.colors.primary}30`,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  infoTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
  },
  infoText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
  },
  formCard: {
    padding: theme.spacing.xl,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.border.light,
  },
  formTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  fieldGroup: {
    marginBottom: theme.spacing.lg,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  fieldLabel: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  fieldHint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  stepContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  stepDivider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.xl,
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
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.tertiary,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    minWidth: 70,
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
  },
  dayButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  dayButtonTextSelected: {
    color: theme.colors.text.inverse,
  },
  selectedDayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.success}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.success}30`,
  },
  selectedDayText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.success,
    fontWeight: theme.fontWeight.semibold,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  timeGroup: {
    flex: 1,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  timeLabel: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  timeArrow: {
    marginTop: 20,
  },
  timeHintCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: `${theme.colors.warning}15`,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: `${theme.colors.warning}30`,
  },
  timeHint: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  bottomSpacing: {
    height: theme.spacing.xxl,
  },
});
