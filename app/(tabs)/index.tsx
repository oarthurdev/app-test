
import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, ActivityIndicator, View, RefreshControl, Animated, TextInput, TouchableOpacity } from 'react-native';
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
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scrollY] = useState(new Animated.Value(0));

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch(`${API_URL}/api/services`);
      const data = await response.json();
      setServices(data);
      setFilteredServices(data);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    if (text.trim() === '') {
      setFilteredServices(services);
      return;
    }

    const query = text.toLowerCase();
    const filtered = services.filter(service => 
      service.name.toLowerCase().includes(query) ||
      service.description?.toLowerCase().includes(query) ||
      service.professionalName.toLowerCase().includes(query)
    );
    
    setFilteredServices(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadServices();
  };

  const headerScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const renderService = ({ item, index }: { item: Service; index: number }) => (
    <Card
      onPress={() => router.push(`/(booking)/service?serviceId=${item.id}`)}
      style={styles.serviceCard}
    >
      <LinearGradient
        colors={['rgba(37, 99, 235, 0.05)', 'rgba(37, 99, 235, 0.02)']}
        style={styles.cardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrapper}>
              <LinearGradient
                colors={theme.colors.gradients.primary}
                style={styles.iconGradient}
              >
                <Ionicons name="sparkles" size={20} color="#fff" />
              </LinearGradient>
            </View>
            <View style={styles.headerInfo}>
              <ThemedText style={styles.serviceName} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={styles.professionalTag}>
                <Ionicons name="person" size={12} color={theme.colors.text.tertiary} />
                <ThemedText style={styles.professionalName} numberOfLines={1}>
                  {item.professionalName}
                </ThemedText>
              </View>
            </View>
          </View>

          {item.description && (
            <ThemedText style={styles.serviceDescription} numberOfLines={2}>
              {item.description}
            </ThemedText>
          )}

          <View style={styles.cardFooter}>
            <View style={styles.infoChip}>
              <Ionicons name="time" size={14} color={theme.colors.primary} />
              <ThemedText style={styles.infoChipText}>{item.duration} min</ThemedText>
            </View>
            
            <View style={styles.priceContainer}>
              <ThemedText style={styles.priceLabel}>a partir de</ThemedText>
              <ThemedText style={styles.priceValue}>
                R$ {parseFloat(item.price).toFixed(2)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.actionButton}>
            <ThemedText style={styles.actionButtonText}>Agendar</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </View>
      </LinearGradient>
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
      <Animated.View 
        style={[
          styles.headerContainer,
          {
            transform: [{ scale: headerScale }],
            opacity: headerOpacity,
          }
        ]}
      >
        <LinearGradient
          colors={theme.colors.gradients.primary}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.header}>
            <View style={styles.welcomeSection}>
              <ThemedText style={styles.greeting}>
                {user ? `Olá, ${user.name?.split(' ')[0]}! 👋` : 'Bem-vindo! 👋'}
              </ThemedText>
              <ThemedText style={styles.headerTitle}>Explore Nossos Serviços</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Escolha o melhor para você
              </ThemedText>
            </View>
            
            {!user && (
              <TouchableOpacity 
                style={styles.professionalLoginButton}
                onPress={() => router.push('/(auth)/login')}
              >
                <Ionicons name="briefcase" size={16} color="#fff" />
                <ThemedText style={styles.professionalLoginText}>
                  Área Profissional
                </ThemedText>
              </TouchableOpacity>
            )}
            
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <ThemedText style={styles.statValue}>{services.length}</ThemedText>
                <ThemedText style={styles.statLabel}>Serviços</ThemedText>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Ionicons name="search" size={20} color={theme.colors.text.tertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar serviços..."
            placeholderTextColor={theme.colors.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <Ionicons 
              name="close-circle" 
              size={20} 
              color={theme.colors.text.tertiary} 
              style={styles.clearIcon}
              onPress={() => handleSearch('')}
            />
          )}
        </View>
      </View>

      <Animated.FlatList
        data={filteredServices}
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
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <Ionicons name="search" size={80} color={theme.colors.text.tertiary} />
            </View>
            <ThemedText style={styles.emptyTitle}>
              {searchQuery ? 'Nenhum serviço encontrado' : 'Nenhum serviço disponível'}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {searchQuery 
                ? 'Tente buscar por outro termo' 
                : 'Novos serviços incríveis em breve!'}
            </ThemedText>
          </View>
        }
      />
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
    gap: theme.spacing.md,
  },
  loadingText: {
    color: theme.colors.text.secondary,
    fontSize: theme.fontSize.md,
  },
  headerContainer: {
    overflow: 'hidden',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
  },
  welcomeSection: {
    marginBottom: theme.spacing.lg,
  },
  greeting: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  headerTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    backdropFilter: 'blur(10px)',
  },
  statValue: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xxs,
  },
  statLabel: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  searchContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.secondary,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.sm,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text.primary,
  },
  clearIcon: {
    marginLeft: theme.spacing.sm,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  serviceCard: {
    marginBottom: theme.spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  cardGradient: {
    borderRadius: theme.borderRadius.lg,
  },
  cardContent: {
    padding: theme.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xxs,
  },
  professionalTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  professionalName: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  serviceDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    lineHeight: 22,
    marginBottom: theme.spacing.md,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
  },
  infoChipText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  priceValue: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.primary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  actionButtonText: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    marginBottom: theme.spacing.xl,
    opacity: 0.3,
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
  professionalLoginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginTop: theme.spacing.md,
    alignSelf: 'flex-start',
    ...theme.shadows.sm,
  },
  professionalLoginText: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: '#fff',
  },
});
