
import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  professionalName: string;
}

interface BusinessHour {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export default function ServiceBookingScreen() {
  const { serviceId } = useLocalSearchParams();
  const { token } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [bookedTimes, setBookedTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadService();
  }, [serviceId]);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability();
    }
  }, [selectedDate]);

  const loadService = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      const services = await response.json();
      const foundService = services.find((s: Service) => s.id === Number(serviceId));
      setService(foundService);
    } catch (error) {
      console.error('Erro ao carregar serviço:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailability = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/appointments/available?serviceId=${serviceId}&date=${selectedDate}`
      );
      const data = await response.json();
      
      if (data.businessHours && data.businessHours.length > 0) {
        const times = generateTimeSlots(data.businessHours[0], service?.duration || 30);
        setAvailableTimes(times);
        setBookedTimes(data.bookedTimes || []);
      } else {
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('Erro ao carregar disponibilidade:', error);
    }
  };

  const generateTimeSlots = (hour: BusinessHour, duration: number) => {
    const slots: string[] = [];
    const [startHour, startMin] = hour.startTime.split(':').map(Number);
    const [endHour, endMin] = hour.endTime.split(':').map(Number);
    
    let currentHour = startHour;
    let currentMin = startMin;
    
    while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMin).padStart(2, '0')}`;
      slots.push(timeStr);
      
      currentMin += duration;
      if (currentMin >= 60) {
        currentHour += Math.floor(currentMin / 60);
        currentMin = currentMin % 60;
      }
    }
    
    return slots;
  };

  const isTimeBooked = (time: string) => {
    if (!selectedDate) return false;
    const [hours, minutes] = time.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return bookedTimes.includes(dateTime.toISOString());
  };

  const handleTimeSelect = (time: string) => {
    if (isTimeBooked(time)) {
      Alert.alert('Horário indisponível', 'Este horário já está reservado');
      return;
    }
    setSelectedTime(time);
  };

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) {
      Alert.alert('Erro', 'Por favor, selecione uma data e horário');
      return;
    }

    const [hours, minutes] = selectedTime.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hours, minutes, 0, 0);

    router.push({
      pathname: '/(booking)/verify',
      params: {
        serviceId,
        appointmentDate: appointmentDate.toISOString(),
      },
    });
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </ThemedView>
    );
  }

  if (!service) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Serviço não encontrado</ThemedText>
      </ThemedView>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const selectedDateObj = selectedDate ? new Date(selectedDate) : null;

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <ThemedText style={styles.headerTitle}>Data e hora</ThemedText>
          <ThemedText style={styles.headerSubtitle}>{service.professionalName}</ThemedText>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Card style={styles.serviceCard}>
          <ThemedText style={styles.serviceName}>{service.name}</ThemedText>
          {service.description && (
            <ThemedText style={styles.serviceDescription}>{service.description}</ThemedText>
          )}
          <View style={styles.serviceDetails}>
            <ThemedText style={styles.servicePrice}>
              de R$ {parseFloat(service.price).toFixed(2)}, {service.duration} min
            </ThemedText>
          </View>
        </Card>

        <Card style={styles.calendarCard}>
          <Calendar
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
              setSelectedTime('');
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: theme.colors.primary,
              },
            }}
            minDate={today}
            theme={{
              selectedDayBackgroundColor: theme.colors.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: theme.colors.primary,
              dayTextColor: theme.colors.text.primary,
              textDisabledColor: theme.colors.text.tertiary,
              monthTextColor: theme.colors.text.primary,
              textMonthFontWeight: 'bold',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              arrowColor: theme.colors.primary,
            }}
            style={styles.calendar}
          />
        </Card>

        {selectedDate && selectedDateObj && (
          <View style={styles.dateLabel}>
            <ThemedText style={styles.dateLabelText}>
              {selectedDateObj.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </ThemedText>
          </View>
        )}

        {selectedDate && (
          <View style={styles.timesContainer}>
            {availableTimes.length === 0 ? (
              <Card style={styles.noTimesCard}>
                <Ionicons name="calendar-outline" size={48} color={theme.colors.text.tertiary} />
                <ThemedText style={styles.noTimesText}>
                  Não há horários disponíveis para esta data
                </ThemedText>
              </Card>
            ) : (
              <View style={styles.timesGrid}>
                {availableTimes.map((time) => {
                  const booked = isTimeBooked(time);
                  return (
                    <TouchableOpacity
                      key={time}
                      style={[
                        styles.timeButton,
                        selectedTime === time && styles.timeButtonSelected,
                        booked && styles.timeButtonBooked,
                      ]}
                      onPress={() => handleTimeSelect(time)}
                      disabled={booked}
                      activeOpacity={0.7}
                    >
                      <ThemedText
                        style={[
                          styles.timeButtonText,
                          selectedTime === time && styles.timeButtonTextSelected,
                          booked && styles.timeButtonTextBooked,
                        ]}
                      >
                        {time}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {selectedDate && selectedTime && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <ThemedText style={styles.continueButtonText}>Continuar</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    backgroundColor: '#d4a5a5',
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  serviceCard: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  serviceName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  serviceDescription: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  servicePrice: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
  },
  calendarCard: {
    marginBottom: theme.spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
  calendar: {
    borderRadius: theme.borderRadius.lg,
  },
  dateLabel: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  dateLabelText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    textTransform: 'capitalize',
  },
  timesContainer: {
    marginBottom: 80,
  },
  noTimesCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  noTimesText: {
    marginTop: theme.spacing.md,
    textAlign: 'center',
    color: theme.colors.text.secondary,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  timeButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
    minWidth: 90,
    alignItems: 'center',
  },
  timeButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  timeButtonBooked: {
    backgroundColor: theme.colors.background.tertiary,
    opacity: 0.5,
  },
  timeButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  timeButtonTextSelected: {
    color: '#fff',
    fontWeight: theme.fontWeight.bold,
  },
  timeButtonTextBooked: {
    textDecorationLine: 'line-through',
    color: theme.colors.text.tertiary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d4a5a5',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.sm,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
});
