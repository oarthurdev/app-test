import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, View, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
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
          <ThemedText>Acesso negado. Apenas profissionais podem acessar esta página.</ThemedText>
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

      Alert.alert('Sucesso', 'Serviço cadastrado com sucesso!');
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

      Alert.alert('Sucesso', 'Horário cadastrado com sucesso!');
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Admin</ThemedText>
          <ThemedText style={styles.subtitle}>Gerenciar serviços e horários</ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Cadastrar Serviço
          </ThemedText>

          <TextInput
            style={styles.input}
            placeholder="Nome do serviço"
            value={serviceName}
            onChangeText={setServiceName}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Descrição (opcional)"
            value={serviceDescription}
            onChangeText={setServiceDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Preço (ex: 50.00)"
            value={servicePrice}
            onChangeText={setServicePrice}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Duração em minutos (ex: 30)"
            value={serviceDuration}
            onChangeText={setServiceDuration}
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddService}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Cadastrar Serviço</ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Cadastrar Horário de Funcionamento
          </ThemedText>

          <View style={styles.pickerContainer}>
            <ThemedText style={styles.label}>Dia da semana:</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
              {DAYS_OF_WEEK.map((day) => (
                <TouchableOpacity
                  key={day.value}
                  style={[styles.dayButton, selectedDay === day.value && styles.dayButtonSelected]}
                  onPress={() => setSelectedDay(day.value)}
                >
                  <ThemedText style={[styles.dayButtonText, selectedDay === day.value && styles.dayButtonTextSelected]}>
                    {day.label.substring(0, 3)}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Horário inicial (ex: 09:00)"
            value={startTime}
            onChangeText={setStartTime}
            placeholderTextColor="#999"
          />

          <TextInput
            style={styles.input}
            placeholder="Horário final (ex: 18:00)"
            value={endTime}
            onChangeText={setEndTime}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleAddBusinessHour}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Cadastrar Horário</ThemedText>
            )}
          </TouchableOpacity>
        </View>
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
    padding: 20,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    paddingTop: 40,
    marginBottom: 20,
  },
  subtitle: {
    marginTop: 5,
    opacity: 0.7,
  },
  section: {
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
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 10,
    fontWeight: '600',
  },
  dayScroll: {
    flexDirection: 'row',
  },
  dayButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    marginRight: 10,
  },
  dayButtonSelected: {
    backgroundColor: '#007AFF',
  },
  dayButtonText: {
    fontSize: 14,
  },
  dayButtonTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
