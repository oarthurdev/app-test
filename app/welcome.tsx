
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function WelcomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="calendar" size={64} color="#fff" />
            </View>
            <ThemedText style={styles.appName}>BookPro</ThemedText>
            <ThemedText style={styles.tagline}>
              Sistema de Agendamentos Profissional
            </ThemedText>
          </View>

          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#fff', '#f8f9fa']}
                style={styles.optionGradient}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="person" size={48} color={theme.colors.primary} />
                </View>
                <ThemedText style={styles.optionTitle}>Sou Cliente</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Agendar serviços e consultar meus horários
                </ThemedText>
                <View style={styles.optionArrow}>
                  <Ionicons name="arrow-forward" size={24} color={theme.colors.primary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionCard}
              onPress={() => router.push('/(auth)/login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#fff', '#f8f9fa']}
                style={styles.optionGradient}
              >
                <View style={styles.optionIconContainer}>
                  <Ionicons name="briefcase" size={48} color={theme.colors.secondary} />
                </View>
                <ThemedText style={styles.optionTitle}>Sou Proprietário</ThemedText>
                <ThemedText style={styles.optionDescription}>
                  Gerenciar meu estabelecimento e agendamentos
                </ThemedText>
                <View style={styles.optionArrow}>
                  <Ionicons name="arrow-forward" size={24} color={theme.colors.secondary} />
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Escolha como deseja usar o BookPro
            </ThemedText>
          </View>
        </View>
      </LinearGradient>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 20,
  },
  optionCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  optionGradient: {
    padding: 24,
    minHeight: 180,
  },
  optionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  optionDescription: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  optionArrow: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  footer: {
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
});
