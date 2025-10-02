import { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ActivityIndicator, View, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function VerifyScreen() {
  const { serviceId, appointmentDate } = useLocalSearchParams();
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [appointmentId, setAppointmentId] = useState<number | null>(null);

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
      setAppointmentId(appointment.id);

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
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Verificação
        </ThemedText>

        <View style={styles.infoCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Dados do Cliente
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Nome:</ThemedText>
            <ThemedText style={styles.value}>{user?.name}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Email:</ThemedText>
            <ThemedText style={styles.value}>{user?.email}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Telefone:</ThemedText>
            <ThemedText style={styles.value}>{user?.phone}</ThemedText>
          </View>
        </View>

        <View style={styles.infoCard}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Dados do Agendamento
          </ThemedText>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Data:</ThemedText>
            <ThemedText style={styles.value}>
              {date.toLocaleDateString('pt-BR')}
            </ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Horário:</ThemedText>
            <ThemedText style={styles.value}>
              {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.warning}>
          Verifique seus dados antes de continuar para o pagamento.
        </ThemedText>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Confirmar e Pagar</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={loading}
        >
          <ThemedText style={styles.cancelButtonText}>Voltar</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 20,
    marginTop: 20,
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    opacity: 0.7,
  },
  value: {
    fontWeight: '600',
  },
  warning: {
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
    fontStyle: 'italic',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
