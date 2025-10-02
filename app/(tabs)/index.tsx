import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

interface Service {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  professionalName: string;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function HomeScreen() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadServices();
    }
  }, [user]);

  const loadServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      const data = await response.json();
      setServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderService = ({ item }: { item: Service }) => (
    <TouchableOpacity
      style={styles.serviceCard}
      onPress={() => router.push(`/(booking)/service?serviceId=${item.id}`)}
    >
      <ThemedText type="defaultSemiBold" style={styles.serviceName}>
        {item.name}
      </ThemedText>
      {item.description && (
        <ThemedText style={styles.serviceDescription}>{item.description}</ThemedText>
      )}
      <ThemedText style={styles.servicePrice}>
        R$ {parseFloat(item.price).toFixed(2)}
      </ThemedText>
      <ThemedText style={styles.serviceDuration}>
        Duração: {item.duration} min
      </ThemedText>
      <ThemedText style={styles.serviceProfessional}>
        Profissional: {item.professionalName}
      </ThemedText>
    </TouchableOpacity>
  );

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
        <ThemedText type="title">Serviços</ThemedText>
        <ThemedText style={styles.subtitle}>
          Escolha um serviço para agendar
        </ThemedText>
      </View>

      {services.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText>Nenhum serviço disponível no momento</ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
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
  subtitle: {
    marginTop: 5,
    opacity: 0.7,
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
  },
  serviceCard: {
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
  serviceDescription: {
    opacity: 0.7,
    marginBottom: 10,
  },
  servicePrice: {
    color: '#007AFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  serviceDuration: {
    opacity: 0.7,
    fontSize: 14,
  },
  serviceProfessional: {
    opacity: 0.7,
    fontSize: 14,
    marginTop: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
