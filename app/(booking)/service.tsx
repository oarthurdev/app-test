import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Calendar, DateData } from 'react-native-calendars';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

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
  const [businessHours, setBusinessHours] = useState<BusinessHour[]>([]);

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
        <ActivityIndicator size="large" color="#007AFF" />
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.serviceInfo}>
          <ThemedText type="title">{service.name}</ThemedText>
          {service.description && (
            <ThemedText style={styles.description}>{service.description}</ThemedText>
          )}
          <ThemedText style={styles.price}>R$ {parseFloat(service.price).toFixed(2)}</ThemedText>
          <ThemedText style={styles.duration}>Duração: {service.duration} min</ThemedText>
        </View>

        <View style={styles.calendarContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Escolha a data
          </ThemedText>
          <Calendar
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
              setSelectedTime('');
            }}
            markedDates={{
              [selectedDate]: {
                selected: true,
                selectedColor: '#007AFF',
              },
            }}
            minDate={today}
            theme={{
              selectedDayBackgroundColor: '#007AFF',
              todayTextColor: '#007AFF',
              arrowColor: '#007AFF',
            }}
          />
        </View>

        {selectedDate && (
          <View style={styles.timeContainer}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Escolha o horário
            </ThemedText>
            {availableTimes.length === 0 ? (
              <ThemedText style={styles.noTimes}>
                Não há horários disponíveis para esta data
              </ThemedText>
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

        {selectedDate && selectedTime && (
          <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
            <ThemedText style={styles.continueButtonText}>Continuar</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  serviceInfo: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  description: {
    marginTop: 10,
    opacity: 0.7,
  },
  price: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  duration: {
    marginTop: 5,
    opacity: 0.7,
  },
  calendarContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    marginBottom: 15,
  },
  timeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noTimes: {
    textAlign: 'center',
    opacity: 0.7,
    paddingVertical: 20,
  },
  timesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  timeButtonSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  timeButtonBooked: {
    backgroundColor: '#f0f0f0',
    opacity: 0.5,
  },
  timeButtonText: {
    fontSize: 14,
  },
  timeButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  timeButtonTextBooked: {
    textDecorationLine: 'line-through',
  },
  continueButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
