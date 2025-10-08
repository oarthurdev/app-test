
import { useState } from 'react';
import { StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { theme } from '@/constants/Theme';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export default function RegisterBusinessScreen() {
  // Dados do estabelecimento
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Dados do proprietário
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleRegister = async () => {
    // Validações
    if (!businessName || !ownerName || !ownerEmail || !ownerPhone || !ownerPassword) {
      Alert.alert('Campos obrigatórios', 'Preencha todos os campos obrigatórios');
      return;
    }

    if (ownerPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    if (ownerPassword.length < 6) {
      Alert.alert('Senha fraca', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(ownerEmail)) {
      Alert.alert('E-mail inválido', 'Digite um e-mail válido');
      return;
    }

    setLoading(true);
    try {
      const slug = generateSlug(businessName);
      
      const response = await fetch(`${API_URL}/api/tenants/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Dados do estabelecimento
          name: businessName,
          slug,
          businessType,
          phone,
          address,
          // Dados do proprietário
          ownerName,
          ownerEmail,
          ownerPassword,
          ownerPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao registrar estabelecimento');
      }

      Alert.alert(
        'Sucesso! 🎉',
        'Seu estabelecimento foi cadastrado com sucesso!',
        [
          {
            text: 'OK',
            onPress: async () => {
              await login(ownerEmail, ownerPassword);
              router.replace('/(tabs)');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Erro', error.message);
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
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="storefront" size={40} color="#fff" />
            </View>
            <ThemedText style={styles.title}>Cadastre seu Estabelecimento</ThemedText>
            <ThemedText style={styles.subtitle}>
              Comece a gerenciar seus agendamentos hoje mesmo
            </ThemedText>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="business" size={24} color={theme.colors.primary} />
                <ThemedText style={styles.sectionTitle}>Dados do Estabelecimento</ThemedText>
              </View>

              <Input
                label="Nome do Estabelecimento *"
                placeholder="Ex: Barbearia Central"
                value={businessName}
                onChangeText={setBusinessName}
                icon="storefront"
              />

              <Input
                label="Tipo de Negócio"
                placeholder="Ex: Salão, Barbearia, Clínica..."
                value={businessType}
                onChangeText={setBusinessType}
                icon="briefcase"
              />

              <Input
                label="Telefone"
                placeholder="(00) 00000-0000"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                icon="call"
              />

              <Input
                label="Endereço"
                placeholder="Rua, número, bairro..."
                value={address}
                onChangeText={setAddress}
                icon="location"
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Ionicons name="person" size={24} color={theme.colors.primary} />
                <ThemedText style={styles.sectionTitle}>Seus Dados (Proprietário)</ThemedText>
              </View>

              <Input
                label="Seu Nome *"
                placeholder="Nome completo"
                value={ownerName}
                onChangeText={setOwnerName}
                icon="person"
              />

              <Input
                label="Seu E-mail *"
                placeholder="seu@email.com"
                value={ownerEmail}
                onChangeText={setOwnerEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                icon="mail"
              />

              <Input
                label="Seu Telefone *"
                placeholder="(00) 00000-0000"
                value={ownerPhone}
                onChangeText={setOwnerPhone}
                keyboardType="phone-pad"
                icon="call"
              />

              <Input
                label="Senha *"
                placeholder="Mínimo 6 caracteres"
                value={ownerPassword}
                onChangeText={setOwnerPassword}
                secureTextEntry
                showPasswordToggle
                icon="lock-closed"
              />

              <Input
                label="Confirmar Senha *"
                placeholder="Digite a senha novamente"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                showPasswordToggle
                icon="lock-closed"
              />
            </View>

            <Button
              title="Criar Estabelecimento"
              onPress={handleRegister}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.registerButton}
            />

            <ThemedText style={styles.loginLink}>
              Já tem uma conta?{' '}
              <ThemedText
                style={styles.loginLinkBold}
                onPress={() => router.push('/(auth)/login')}
              >
                Fazer Login
              </ThemedText>
            </ThemedText>
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
    paddingBottom: theme.spacing.lg,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: theme.fontSize.xxxl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: theme.borderRadius.xxl,
    borderTopRightRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.lg,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border.light,
    marginVertical: theme.spacing.xl,
  },
  registerButton: {
    marginTop: theme.spacing.xl,
  },
  loginLink: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  loginLinkBold: {
    color: theme.colors.primary,
    fontWeight: theme.fontWeight.bold,
  },
});
