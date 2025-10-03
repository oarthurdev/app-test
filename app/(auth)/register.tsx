import { useState } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!name || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, phone, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Erro ao registrar');
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
        colors={[theme.colors.secondary, theme.colors.primary]}
        style={styles.gradient}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ThemedText style={styles.iconText}>✨</ThemedText>
            </View>
            <ThemedText style={styles.title}>Criar Conta</ThemedText>
            <ThemedText style={styles.subtitle}>
              Junte-se a nós e comece sua jornada
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <Input
              label="Nome Completo"
              placeholder="João Silva"
              value={name}
              onChangeText={setName}
              icon="person-outline"
            />

            <Input
              label="E-mail"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail-outline"
            />

            <Input
              label="Telefone"
              placeholder="+55 11 99999-9999"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              icon="call-outline"
            />

            <Input
              label="Senha"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              showPasswordToggle
              icon="lock-closed-outline"
            />

            <Input
              label="Confirmar Senha"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              showPasswordToggle
              icon="lock-closed-outline"
            />

            <Button
              title="Criar Conta"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.registerButton}
            />

            <Button
              title="Já tem conta? Faça login"
              onPress={() => router.back()}
              variant="ghost"
              fullWidth
              style={styles.loginButton}
            />
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
  header: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.xxl,
    paddingBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  iconText: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
  },
  registerButton: {
    marginTop: theme.spacing.md,
  },
  loginButton: {
    marginTop: theme.spacing.md,
  },
});
