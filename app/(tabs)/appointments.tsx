import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

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

export default function AppointmentsScreen() {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadAppointments();
    }
  }, [token]);

  const loadAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/appointments/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAppointment = ({ item }: { item: Appointment }) => {
    const date = new Date(item.appointmentDate);
    return (
      <View style={styles.appointmentCard}>
        <ThemedText type="defaultSemiBold" style={styles.serviceName}>
          {item.serviceName}
        </ThemedText>
        <ThemedText style={styles.professionalName}>
          Profissional: {item.professionalName}
        </ThemedText>
        <ThemedText style={styles.date}>
          Data: {date.toLocaleDateString('pt-BR')} às {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </ThemedText>
        <ThemedText style={styles.price}>
          Valor: R$ {parseFloat(item.servicePrice).toFixed(2)}
        </ThemedText>
        <View style={styles.statusContainer}>
          <ThemedText style={[styles.status, item.status === 'confirmed' && styles.statusConfirmed]}>
            {item.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
          </ThemedText>
          <ThemedText style={[styles.status, item.paymentStatus === 'paid' && styles.statusPaid]}>
            {item.paymentStatus === 'paid' ? 'Pago' : 'Aguardando pagamento'}
          </ThemedText>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Meus Agendamentos</ThemedText>
      </View>

      {appointments.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>Você ainda não tem agendamentos</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={appointments}
          renderItem={renderAppointment}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  header: {
    padding: 20,
    paddingTop: 60,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  appointmentCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceName: {
    fontSize: 18,
    marginBottom: 8,
  },
  professionalName: {
    opacity: 0.7,
    marginBottom: 5,
  },
  date: {
    marginBottom: 5,
  },
  price: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  status: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    backgroundColor: '#FFA500',
    color: '#fff',
    overflow: 'hidden',
  },
  statusConfirmed: {
    backgroundColor: '#28A745',
  },
  statusPaid: {
    backgroundColor: '#28A745',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
