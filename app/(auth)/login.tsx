
import { useState } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                style={styles.logoGradient}
              >
                <Ionicons name="business" size={48} color="#fff" />
              </LinearGradient>
            </View>
            <ThemedText style={styles.appName}>BookPro</ThemedText>
            <ThemedText style={styles.tagline}>
              Sistema Profissional de Agendamentos
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.welcomeSection}>
              <ThemedText style={styles.welcomeTitle}>Bem-vindo de volta</ThemedText>
              <ThemedText style={styles.welcomeSubtitle}>
                Faça login para continuar
              </ThemedText>
            </View>

            <View style={styles.form}>
              <Input
                label="E-mail"
                placeholder="seu@email.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                icon="mail"
              />

              <Input
                label="Senha"
                placeholder="Digite sua senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                showPasswordToggle
                icon="lock-closed"
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <ThemedText style={styles.forgotPasswordText}>
                  Esqueceu a senha?
                </ThemedText>
              </TouchableOpacity>

              <Button
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
                fullWidth
                size="lg"
                style={styles.loginButton}
              />

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <ThemedText style={styles.dividerText}>ou</ThemedText>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity 
                style={styles.registerLink}
                onPress={() => router.push('/(auth)/register')}
              >
                <ThemedText style={styles.registerText}>
                  Não tem uma conta? <ThemedText style={styles.registerTextBold}>Cadastre-se</ThemedText>
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.demoCard}>
              <View style={styles.demoHeader}>
                <Ionicons name="information-circle" size={20} color={theme.colors.info} />
                <ThemedText style={styles.demoTitle}>Conta Demo</ThemedText>
              </View>
              <View style={styles.demoContent}>
                <View style={styles.demoRow}>
                  <Ionicons name="mail" size={14} color={theme.colors.text.tertiary} />
                  <ThemedText style={styles.demoText}>profissional@teste.com</ThemedText>
                </View>
                <View style={styles.demoRow}>
                  <Ionicons name="key" size={14} color={theme.colors.text.tertiary} />
                  <ThemedText style={styles.demoText}>senha123</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: theme.spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxxl,
    paddingBottom: theme.spacing.xxl,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: theme.spacing.lg,
    overflow: 'hidden',
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: 60,
  },
  appName: {
    fontSize: theme.fontSize.display,
    fontWeight: theme.fontWeight.extrabold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontWeight: theme.fontWeight.medium,
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    ...theme.shadows.xl,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
  },
  welcomeTitle: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  form: {
    gap: theme.spacing.md,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -theme.spacing.xs,
  },
  forgotPasswordText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.semibold,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border.light,
  },
  dividerText: {
    marginHorizontal: theme.spacing.md,
    color: theme.colors.text.tertiary,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.medium,
  },
  registerLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  registerText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text.secondary,
  },
  registerTextBold: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
  demoCard: {
    marginTop: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.light,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  demoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  demoContent: {
    gap: theme.spacing.sm,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  demoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
});
