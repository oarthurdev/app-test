
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
                  Agendar serviços e ver meus agendamentos
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
    paddingHorizontal: theme.spacing.xl,
    paddingTop: 80,
    paddingBottom: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  optionsContainer: {
    gap: theme.spacing.lg,
  },
  optionCard: {
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  optionGradient: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  optionIconContainer: {
    marginBottom: theme.spacing.md,
  },
  optionTitle: {
    fontSize: theme.fontSize.xxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  optionDescription: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  optionArrow: {
    marginTop: theme.spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontSize: theme.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
