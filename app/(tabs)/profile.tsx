import { StyleSheet, TouchableOpacity, View, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Deseja realmente sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Perfil</ThemedText>
      </View>

      <View style={styles.content}>
        <View style={styles.infoCard}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Nome:</ThemedText>
          <ThemedText style={styles.value}>{user?.name}</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Email:</ThemedText>
          <ThemedText style={styles.value}>{user?.email}</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Telefone:</ThemedText>
          <ThemedText style={styles.value}>{user?.phone}</ThemedText>
        </View>

        <View style={styles.infoCard}>
          <ThemedText type="defaultSemiBold" style={styles.label}>Tipo de conta:</ThemedText>
          <ThemedText style={styles.value}>
            {user?.role === 'professional' ? 'Profissional' : 'Cliente'}
          </ThemedText>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <ThemedText style={styles.logoutButtonText}>Sair</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  content: {
    padding: 20,
  },
  infoCard: {
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
  label: {
    fontSize: 14,
    marginBottom: 5,
    opacity: 0.7,
  },
  value: {
    fontSize: 16,
  },
  logoutButton: {
    backgroundColor: '#DC3545',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
