import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

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
  const [refreshing, setRefreshing] = useState(false);

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
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const renderService = ({ item, index }: { item: Service; index: number }) => (
    <Card
      onPress={() => router.push(`/(booking)/service?serviceId=${item.id}`)}
      style={styles.serviceCard}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconCircle}>
          <Ionicons name="cut-outline" size={24} color={theme.colors.primary} />
        </View>
        <View style={styles.priceTag}>
          <ThemedText style={styles.priceText}>
            R$ {parseFloat(item.price).toFixed(2)}
          </ThemedText>
        </View>
      </View>

      <ThemedText style={styles.serviceName}>{item.name}</ThemedText>
      
      {item.description && (
        <ThemedText style={styles.serviceDescription} numberOfLines={2}>
          {item.description}
        </ThemedText>
      )}

      <View style={styles.cardFooter}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={16} color={theme.colors.text.secondary} />
          <ThemedText style={styles.infoText}>{item.duration} min</ThemedText>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="person-outline" size={16} color={theme.colors.text.secondary} />
          <ThemedText style={styles.infoText} numberOfLines={1}>
            {item.professionalName}
          </ThemedText>
        </View>
      </View>

      <View style={styles.arrowContainer}>
        <Ionicons name="arrow-forward" size={20} color={theme.colors.primary} />
      </View>
    </Card>
  );

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <ThemedText style={styles.loadingText}>Carregando serviços...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.primaryDark]}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <ThemedText style={styles.greeting}>Olá, {user?.name}! 👋</ThemedText>
          <ThemedText style={styles.title}>Serviços Disponíveis</ThemedText>
          <ThemedText style={styles.subtitle}>
            Escolha um serviço e agende seu horário
          </ThemedText>
        </View>
      </LinearGradient>

      {services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons name="calendar-outline" size={64} color={theme.colors.text.tertiary} />
          </View>
          <ThemedText style={styles.emptyTitle}>Nenhum serviço disponível</ThemedText>
          <ThemedText style={styles.emptyText}>
            Novos serviços serão adicionados em breve!
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          }
        />
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
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.text.secondary,
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
  },
  greeting: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
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
  },
  listContent: {
    padding: theme.spacing.lg,
  },
  serviceCard: {
    marginBottom: theme.spacing.lg,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priceTag: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  priceText: {
    color: theme.colors.text.inverse,
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
  },
  serviceName: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  serviceDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.md,
    lineHeight: 22,
  },
  cardFooter: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flex: 1,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    flex: 1,
  },
  arrowContainer: {
    position: 'absolute',
    right: theme.spacing.lg,
    bottom: theme.spacing.lg,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
